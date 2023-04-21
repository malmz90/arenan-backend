const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  const token = req.cookies.arenan_token;
  if (token) {
    try {
      const verification = jsonwebtoken.verify(
        token,
        process.env.ACCES_TOKEN_SECRET,
        {
          algorithms: ["HS256"],
        }
      );
      req.jwt = verification;
      next();
    } catch (err) {
      res.status(401).json({
        success: false,
        msg: "You are not authorized to visit this route" + err,
      });
    }
  } else {
    res.status(401).json({
      success: false,
      msg: "You are not authorized to visit this route",
    });
  }
};

module.exports = { verifyJwt };
