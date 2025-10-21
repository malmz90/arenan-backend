const db = require("../config/db");
const {
  equipItem,
  unequipItem,
  getCharacterEquipment,
  getCharacterInventory,
  getCharacterStats,
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

    res.json({
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        experience: character.experience,
        gold: character.gold,
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

module.exports = {
  createCharacter,
  handleEquipItem,
  handleUnequipItem,
  getEquipment,
  getInventory,
  getAllCharacters,
  getStats,
};
