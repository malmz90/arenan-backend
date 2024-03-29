const express = require("express");
const router = express.Router();
const characterController = require("../controllers/characterController");
const { verifyJwt } = require("../middleware/auth");

router.post("/create", verifyJwt, characterController.createCharacter);

module.exports = router;
