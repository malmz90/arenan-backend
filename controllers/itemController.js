const db = require("../config/db");

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

module.exports = { getItems };
