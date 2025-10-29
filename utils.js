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

async function equipItem(characterId, itemId, slot) {
  // First, verify the item is in the character's inventory
  const inventoryCheck = await db.query(
    "SELECT * FROM character_inventory WHERE character_id = ? AND item_id = ?",
    [characterId, itemId]
  );

  if (inventoryCheck.length === 0) {
    throw new Error("Item not found in character's inventory");
  }

  // Get the item details to verify the item type matches the slot
  const item = await db.query(
    `SELECT bi.item_type FROM items i 
     JOIN base_items bi ON i.base_item_id = bi.id 
     WHERE i.id = ?`,
    [itemId]
  );

  if (item.length === 0) {
    throw new Error("Item not found");
  }

  const itemType = item[0].item_type;

  // Validate that the item type matches the slot
  const validSlots = {
    head: "head",
    chest: "chest",
    legs: "legs",
    main_hand: "weapon",
    off_hand: "shield",
    ring: "ring",
    amulet: "amulet",
  };

  if (validSlots[slot] !== itemType) {
    throw new Error(`Cannot equip ${itemType} in ${slot} slot`);
  }

  // Check if there's already an item equipped in that slot
  const currentEquipment = await db.query(
    `SELECT ${slot} FROM character_equipment WHERE character_id = ?`,
    [characterId]
  );

  const currentItemId = currentEquipment[0][slot];

  // Update the equipment slot
  await db.query(
    `UPDATE character_equipment SET ${slot} = ? WHERE character_id = ?`,
    [itemId, characterId]
  );

  // Remove the item from inventory
  await db.query(
    "DELETE FROM character_inventory WHERE character_id = ? AND item_id = ?",
    [characterId, itemId]
  );

  // If there was a previously equipped item, add it back to inventory
  if (currentItemId) {
    await addItemToInventory(characterId, currentItemId);
  }

  return { success: true, unequippedItem: currentItemId };
}

async function unequipItem(characterId, slot) {
  // Get the currently equipped item in the slot
  const equipment = await db.query(
    `SELECT ${slot} FROM character_equipment WHERE character_id = ?`,
    [characterId]
  );

  if (equipment.length === 0) {
    throw new Error("Character equipment not found");
  }

  const itemId = equipment[0][slot];

  if (!itemId) {
    throw new Error(`No item equipped in ${slot} slot`);
  }

  // Unequip the item
  await db.query(
    `UPDATE character_equipment SET ${slot} = NULL WHERE character_id = ?`,
    [characterId]
  );

  // Add the item back to inventory
  await addItemToInventory(characterId, itemId);

  return { success: true, unequippedItemId: itemId };
}

async function getCharacterEquipment(characterId) {
  const equipment = await db.query(
    `SELECT * FROM character_equipment WHERE character_id = ?`,
    [characterId]
  );

  if (equipment.length === 0) {
    return null;
  }

  const equipmentData = equipment[0];
  const slots = [
    "head",
    "chest",
    "legs",
    "main_hand",
    "off_hand",
    "ring",
    "amulet",
  ];

  // Fetch full item details for each equipped item
  const equippedItems = {};
  for (const slot of slots) {
    if (equipmentData[slot]) {
      const item = await getItemWithAffixes(equipmentData[slot]);
      equippedItems[slot] = item;
    } else {
      equippedItems[slot] = null;
    }
  }

  return equippedItems;
}

async function getCharacterInventory(characterId) {
  const inventory = await db.query(
    `SELECT ci.id as inventory_slot_id, ci.item_id 
     FROM character_inventory ci 
     WHERE ci.character_id = ?`,
    [characterId]
  );

  // Fetch full item details for each inventory item
  const inventoryItems = [];
  for (const slot of inventory) {
    const item = await getItemWithAffixes(slot.item_id);
    inventoryItems.push({
      inventory_slot_id: slot.inventory_slot_id,
      ...item,
    });
  }

  return inventoryItems;
}

/**
 * Calculate character's total stats including base stats and equipment bonuses
 */
async function getCharacterStats(characterId) {
  // Get base character stats
  const character = await db.query("SELECT * FROM characters WHERE id = ?", [
    characterId,
  ]);

  if (character.length === 0) {
    throw new Error("Character not found");
  }

  const char = character[0];

  // Initialize stats with base values
  let stats = {
    strength: char.strength || 0,
    vitality: char.vitality || 0,
    dexterity: char.dexterity || 0,
    bonusDamage: 0,
    bonusDefense: 0,
    bonusHP: 0,
  };

  // Get equipped items and their affixes
  const equipment = await getCharacterEquipment(characterId);

  // Calculate bonuses from equipment
  for (const slot in equipment) {
    const item = equipment[slot];
    if (item && item.affixes) {
      for (const affix of item.affixes) {
        // Apply affixes based on their type
        switch (affix.affix_type) {
          case "strength":
            stats.strength += affix.value;
            break;
          case "vitality":
            stats.vitality += affix.value;
            break;
          case "dexterity":
            stats.dexterity += affix.value;
            break;
          case "damage":
            stats.bonusDamage += affix.value;
            break;
          case "defense":
            stats.bonusDefense += affix.value;
            break;
          case "hp":
            stats.bonusHP += affix.value;
            break;
        }
      }
    }

    // Add weapon damage if equipped
    if (slot === "main_hand" && item) {
      stats.weaponMinDamage = item.min_dmg || 0;
      stats.weaponMaxDamage = item.max_dmg || 0;
    }
  }

  // Calculate derived stats
  const maxHP = calculateMaxHP(stats.vitality, stats.bonusHP);
  const damage = calculateCharacterDamage(
    stats.strength,
    stats.dexterity,
    stats.weaponMinDamage || 0,
    stats.weaponMaxDamage || 0,
    stats.bonusDamage
  );
  const defense = calculateCharacterDefense(stats.vitality, stats.bonusDefense);

  return {
    ...stats,
    maxHP,
    damage,
    defense,
  };
}

/**
 * Calculate max HP based on vitality
 * Formula: 100 base HP + (vitality * 10) + bonus HP
 */
function calculateMaxHP(vitality, bonusHP = 0) {
  return 100 + vitality * 10 + bonusHP;
}

/**
 * Calculate character damage range
 * Returns average damage for simplicity
 */
function calculateCharacterDamage(
  strength,
  dexterity,
  weaponMinDmg = 0,
  weaponMaxDmg = 0,
  bonusDamage = 0
) {
  // Base damage from stats (strength gives more damage than dexterity)
  const statDamage = strength * 2 + dexterity * 1;

  // Weapon damage (average of min and max)
  const weaponDamage = weaponMinDmg > 0 ? (weaponMinDmg + weaponMaxDmg) / 2 : 0;

  // Total damage
  const totalDamage = statDamage + weaponDamage + bonusDamage;

  return Math.max(1, Math.floor(totalDamage)); // Minimum 1 damage
}

/**
 * Calculate character defense
 * Defense reduces incoming damage
 */
function calculateCharacterDefense(vitality, bonusDefense = 0) {
  // Each point of vitality gives 0.5 defense
  const vitalityDefense = vitality * 0.5;

  return Math.floor(vitalityDefense + bonusDefense);
}

/**
 * Calculate actual damage dealt after defense
 * Formula: damage - (defense * 0.5)
 * Minimum damage is always at least 1
 */
function calculateDamage(attackerDamage, defenderDefense) {
  const damageReduction = defenderDefense * 0.5;
  const actualDamage = attackerDamage - damageReduction;

  // Add some randomness (±10%)
  const randomFactor = 0.9 + Math.random() * 0.2;
  const finalDamage = Math.floor(actualDamage * randomFactor);

  return Math.max(1, finalDamage); // Always deal at least 1 damage
}

/**
 * Experience requirement for the NEXT level based on current level
 * Exponential growth starting at 100 and scaling by 1.5x per level.
 * Example: level 1 -> 100, level 2 -> 150, level 3 -> 225, etc.
 * Adjust BASE_XP and GROWTH_RATE to tune the curve.
 */
function getExpForLevel(level) {
  const BASE_XP = 100;
  const GROWTH_RATE = 1.5;
  if (!level || level < 1) return BASE_XP;
  return Math.floor(BASE_XP * Math.pow(GROWTH_RATE, level - 1));
}

module.exports = {
  genPassword,
  rollRarity,
  createNewItemWithAffixes,
  addAffixesToItem,
  getItemWithAffixes,
  addItemToInventory,
  createNewItemWithoutAffixes,
  equipItem,
  unequipItem,
  getCharacterEquipment,
  getCharacterInventory,
  getCharacterStats,
  calculateMaxHP,
  calculateCharacterDamage,
  calculateCharacterDefense,
  calculateDamage,
  getExpForLevel,
};
