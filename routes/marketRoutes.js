const express = require("express");
const router = express.Router();
const marketController = require("../controllers/marketController");
const { verifyJwt } = require("../middleware/auth");

router.post("/buy-item", verifyJwt, marketController.buyItem);

module.exports = router;
