const db = require("../config/db");
const {
  equipItem,
  unequipItem,
  getCharacterEquipment,
  getCharacterInventory,
  getCharacterStats,
  getExpForLevel,
} = require("../utils");

const createCharacter = async (req, res) => {
  const { id } = req.jwt;
  const { name, class_id, strength, vitality, dexterity, gender } = req.body;

  try {
    const { insertId } = await db.query(
      `INSERT INTO characters (user_id, class_id, name, strength, vitality, dexterity, gender) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, class_id, name, strength, vitality, dexterity, gender]
    );

    // Initialize empty equipment for the new character
    await db.query(
      `INSERT INTO character_equipment (character_id) VALUES (?)`,
      [insertId]
    );

    const newCharacter = await db.query(
      "SELECT * FROM characters WHERE characters.id = ?",
      [insertId]
    );

    res.json(newCharacter[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when trying to create new character",
    });
  }
};

const handleEquipItem = async (req, res) => {
  const userId = req.jwt.id;
  const { itemId, slot } = req.body;

  // Validate slot
  const validSlots = [
    "head",
    "chest",
    "legs",
    "main_hand",
    "off_hand",
    "ring",
    "amulet",
  ];
  if (!validSlots.includes(slot)) {
    return res.status(400).json({ message: "Invalid equipment slot" });
  }

  try {
    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];
    const result = await equipItem(character.id, itemId, slot);

    res.json({
      message: "Item equipped successfully",
      ...result,
    });
  } catch (err) {
    console.log(err);
    if (
      err.message.includes("not found") ||
      err.message.includes("Cannot equip")
    ) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).send({
      message: "Something went wrong when trying to equip item",
    });
  }
};

const handleUnequipItem = async (req, res) => {
  const userId = req.jwt.id;
  const { slot } = req.body;

  // Validate slot
  const validSlots = [
    "head",
    "chest",
    "legs",
    "main_hand",
    "off_hand",
    "ring",
    "amulet",
  ];
  if (!validSlots.includes(slot)) {
    return res.status(400).json({ message: "Invalid equipment slot" });
  }

  try {
    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];
    const result = await unequipItem(character.id, slot);

    res.json({
      message: "Item unequipped successfully",
      ...result,
    });
  } catch (err) {
    console.log(err);
    if (err.message.includes("not found") || err.message.includes("No item")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).send({
      message: "Something went wrong when trying to unequip item",
    });
  }
};

const getEquipment = async (req, res) => {
  const userId = req.jwt.id;

  try {
    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];
    const equipment = await getCharacterEquipment(character.id);

    res.json(equipment);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when trying to fetch equipment",
    });
  }
};

const getInventory = async (req, res) => {
  const userId = req.jwt.id;

  try {
    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];
    const inventory = await getCharacterInventory(character.id);

    res.json(inventory);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when trying to fetch inventory",
    });
  }
};

const getAllCharacters = async (req, res) => {
  try {
    const characters = await db.query(
      `SELECT c.id, c.name, c.level, c.experience, c.strength, c.vitality, c.dexterity, c.gold, cl.name as class_name 
       FROM characters c 
       LEFT JOIN classes cl ON c.class_id = cl.id 
       ORDER BY c.level DESC, c.name ASC`
    );
    res.json(characters);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when trying to fetch characters",
    });
  }
};

const getStats = async (req, res) => {
  const userId = req.jwt.id;

  try {
    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];
    const stats = await getCharacterStats(character.id);

    const unspent = character.unspent_stat_points || 0;
    const nextReq = getExpForLevel(character.level || 1);
    const expToNext = Math.max(0, nextReq - (character.experience || 0));

    res.json({
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        experience: character.experience,
        gold: character.gold,
        max_rounds: character.max_rounds || 0,
        current_rounds: character.current_rounds || 0,
        unspent_stat_points: unspent,
        next_level_experience: nextReq,
        exp_to_next_level: expToNext,
      },
      stats,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when trying to fetch character stats",
    });
  }
};

const allocateStats = async (req, res) => {
  const userId = req.jwt.id;
  const { strength = 0, vitality = 0, dexterity = 0 } = req.body || {};

  try {
    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];
    const unspent = character.unspent_stat_points || 0;

    const s = Number(strength) || 0;
    const v = Number(vitality) || 0;
    const d = Number(dexterity) || 0;
    if (s < 0 || v < 0 || d < 0) {
      return res
        .status(400)
        .json({ message: "Stat points must be non-negative" });
    }
    const total = s + v + d;
    if (total === 0) {
      return res.status(400).json({ message: "No stat points allocated" });
    }
    if (total > unspent) {
      return res
        .status(400)
        .json({ message: "Allocated points exceed available points" });
    }

    await db.query(
      "UPDATE characters SET strength = strength + ?, vitality = vitality + ?, dexterity = dexterity + ?, unspent_stat_points = ? WHERE id = ?",
      [s, v, d, unspent - total, character.id]
    );

    const updated = await db.query(
      "SELECT id, name, level, experience, gold, max_rounds, current_rounds, COALESCE(unspent_stat_points,0) AS unspent_stat_points, strength, vitality, dexterity FROM characters WHERE id = ?",
      [character.id]
    );

    res.json({
      message: "Stats allocated successfully",
      character: updated[0],
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when allocating stats",
    });
  }
};

module.exports = {
  createCharacter,
  handleEquipItem,
  handleUnequipItem,
  getEquipment,
  getInventory,
  getAllCharacters,
  getStats,
  allocateStats,
};
