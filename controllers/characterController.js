const db = require("../config/db");

const createCharacter = async (req, res) => {
  const { id } = req.jwt;
  const { name, class_id, strength, vitality, dexterity } = req.body;

  try {
    const { insertId } = await db.query(
      `INSERT INTO characters (user_id, class_id, name, strength, vitality, dexterity) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, class_id, name, strength, vitality, dexterity]
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

module.exports = { createCharacter };
