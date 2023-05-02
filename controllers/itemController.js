const db = require("../config/db");
const {
  rollRarity,
  createNewItemWithAffixes,
  getItemWithAffixes,
  addItemToInventory,
  createNewItemWithoutAffixes,
} = require("../utils");
const { rarities } = require("../config/itemRarities");

getItems = async (req, res) => {
  try {
    const items = await db.query(
      `SELECT * FROM items
        `
    );
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong when trying to fetch items",
    });
  }
};

generateNewItem = async (req, res) => {
  const userId = req.jwt.id;

  // Get the character associated with the user
  const characters = await db.query(
    "SELECT * FROM characters WHERE user_id = ?",
    [userId]
  );
  if (characters.length === 0) {
    return res.status(404).json({ message: "Character not found" });
  }

  const character = characters[0];
  const characterId = character.id;

  const baseItems = await db.query(`SELECT * FROM base_items`);
  const randomIndex = Math.floor(Math.random() * baseItems.length);
  const randomBaseItem = baseItems[randomIndex];

  const rarity = rollRarity(rarities);

  let item;
  let newItemId;
  if (rarity.name === "common") {
    item = { ...randomBaseItem, affixes: [] };
    newItemId = await createNewItemWithoutAffixes(randomBaseItem.id);
  } else {
    newItemId = await createNewItemWithAffixes(rarity, randomBaseItem.id);
    item = await getItemWithAffixes(newItemId);
  }

  await addItemToInventory(characterId, newItemId);
  res.json(item);
};

module.exports = { getItems, generateNewItem };
