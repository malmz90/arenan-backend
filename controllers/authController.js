const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { genPassword } = require("../utils");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await db.query(
      `
          SELECT
            *
          FROM 
              users
          WHERE
              users.email = ?
      `,
      [email]
    );

    if (!users.length) {
      return res.json({ message: "No user found" });
    }

    const user = users[0];
    const dbPassword = `$2b$${user.password.slice(4)}`;

    if (bcrypt.compareSync(password, dbPassword)) {
      const token = jwt.sign({ id: user.id }, process.env.ACCES_TOKEN_SECRET, {
        expiresIn: "4h",
      });

      // Fetch character data
      const characters = await db.query(
        `
          SELECT
            *
          FROM
            characters
          WHERE
            characters.user_id = ?
        `,
        [user.id]
      );

      const character = characters.length ? characters[0] : null;
      console.log(character);
      res.cookie("arenan_token", token);
      return res.json({
        success: true,
        user: user,
        character: character, // Include character data in the response
        token: "Bearer " + token,
      });
    } else return res.json({ message: "password/username invalid" });
  } catch (error) {
    console.log(error);
    return res.json({ err: error });
  }
};

const register = async (req, res) => {
  const hashedPassword = await genPassword(req.body.password);
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .send({ success: false, error: "Missing input parameters." });
  }
  try {
    const queryResult = await db.query(
      "INSERT INTO users(email,password) VALUES( ?, ? )",
      [email, hashedPassword]
    );
    const id = Number(queryResult.insertId);
    const user = {
      id: id,
      email: email,
    };

    res.json(user);
  } catch (error) {
    console.log("errfart", { error });
    let userError = "Ett okänt fel inträffade.";
    if (error.code === "ER_DUP_ENTRY") {
      userError = "E-postadressen eller användarnamn används redan";
    }
    return res.json({ isAuthenticated: false, error: userError });
  }
};

const logout = (req, res) => {
  res.cookie("arenan_token", "", { maxAge: 1 });
  res.json();
};

module.exports = { login, register, logout };
