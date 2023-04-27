const db = require("../config/db");
const { rollRarity } = require("../utils");
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
  const baseItems = await db.query(`SELECT * FROM base_items`);
  const randomIndex = Math.floor(Math.random() * baseItems.length);
  const randomBaseItem = baseItems[randomIndex];

  const rarity = rollRarity(rarities);
  console.log(rarity);

  res.json(randomBaseItem);
};

module.exports = { getItems, generateNewItem };
