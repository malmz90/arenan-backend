const db = require("../config/db");

const buyItem = async (req, res) => {
  const { id: itemId } = req.body;
  const userId = req.jwt.id;

  try {
    // Get the base item and its price
    const baseItems = await db.query("SELECT * FROM base_items WHERE id = ?", [
      itemId,
    ]);
    if (baseItems.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const baseItem = baseItems[0];
    const price = baseItem.price;

    // Get the character associated with the user
    const characters = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (characters.length === 0) {
      return res.status(404).json({ message: "Character not found" });
    }

    const character = characters[0];

    // Check if the character has enough gold to buy the item
    if (character.gold < price) {
      return res
        .status(400)
        .json({ message: "Not enough gold to buy the item" });
    }

    // Create the new item in the items table
    const newItem = await db.query(
      "INSERT INTO items (rarity, base_item_id) VALUES (?, ?)",
      [baseItem.rarity, itemId]
    );

    // Add the item to the character's inventory
    await db.query(
      "INSERT INTO character_inventory (character_id, item_id) VALUES (?, ?)",
      [character.id, newItem.insertId]
    );

    // Deduct the gold from the character
    await db.query("UPDATE characters SET gold = gold - ? WHERE id = ?", [
      price,
      character.id,
    ]);

    res.status(200).json({ message: "Item purchased successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while purchasing the item" });
  }
};

module.exports = {
  buyItem,
};
