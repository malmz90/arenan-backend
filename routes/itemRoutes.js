const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const { verifyJwt } = require("../middleware/auth");

router.get("/items", verifyJwt, itemController.getItems);

module.exports = router;
