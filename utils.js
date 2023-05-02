const bcrypt = require("bcrypt");
const db = require("./config/db.js");

function genPassword(password) {
  return bcrypt.hash(password, 10);
}

function rollRarity(rarities) {
  const totalChance = rarities.reduce((sum, rarity) => sum + rarity.chance, 0);
  const roll = Math.random() * totalChance;

  let accumulatedChance = 0;
  for (const rarity of rarities) {
    accumulatedChance += rarity.chance;
    if (roll < accumulatedChance) {
      return rarity;
    }
  }

  // This line should never be reached, but it's here as a fallback.
  return rarities[0];
}

async function createNewItemWithAffixes(rarity, baseItemId) {
  // Insert the new item with the specified rarity into the items table
  const newItem = await db.query(
    "INSERT INTO items (rarity, base_item_id) VALUES (?, ?)",
    [rarity.name, baseItemId]
  );

  // Get the new item's ID
  const newItemId = newItem.insertId;

  // Select and insert primary affixes
  await addAffixesToItem(newItemId, "primary", rarity.primaryAffixes);

  // If the rarity has secondary affixes, select and insert secondary affixes
  if (rarity.secondaryAffixes > 0) {
    await addAffixesToItem(newItemId, "secondary", rarity.secondaryAffixes);
  }

  // Return the new item's ID
  return newItemId;
}

async function addAffixesToItem(itemId, category, count) {
  // Select random affixes based on the count from the affixes table
  const affixes = await db.query(
    `SELECT * FROM affixes WHERE category = ? ORDER BY RAND() LIMIT ?`,
    [category, count]
  );

  // Insert the selected affixes along with the itemId into the item_affixes table
  for (const affix of affixes) {
    // Generate a random value within the defined range for the affix
    const minValue = affix.min_value; // replace with the actual column name for the minimum value
    const maxValue = affix.max_value; // replace with the actual column name for the maximum value
    const value =
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;

    await db.query(
      "INSERT INTO item_affixes (item_id, affix_id, value) VALUES (?, ?, ?)",
      [itemId, affix.id, value]
    );
  }
}

async function getItemWithAffixes(itemId) {
  const item = await db.query("SELECT * FROM items WHERE id = ?", [itemId]);
  if (item.length === 0) {
    return null;
  }

  const baseItem = await db.query("SELECT * FROM base_items WHERE id = ?", [
    item[0].base_item_id,
  ]);

  const affixes = await db.query(
    `
    SELECT a.*, ia.value FROM affixes a
    JOIN item_affixes ia ON ia.affix_id = a.id
    WHERE ia.item_id = ?`,
    [itemId]
  );

  return {
    ...item[0],
    ...baseItem[0],
    affixes,
  };
}

async function addItemToInventory(characterId, itemId) {
  await db.query(
    "INSERT INTO character_inventory (character_id, item_id) VALUES (?, ?)",
    [characterId, itemId]
  );
}

async function createNewItemWithoutAffixes(baseItemId) {
  const result = await db.query(
    "INSERT INTO items (rarity, base_item_id) VALUES (?, ?)",
    ["common", baseItemId]
  );
  return result.insertId;
}

module.exports = {
  genPassword,
  rollRarity,
  createNewItemWithAffixes,
  addAffixesToItem,
  getItemWithAffixes,
  addItemToInventory,
  createNewItemWithoutAffixes,
};
