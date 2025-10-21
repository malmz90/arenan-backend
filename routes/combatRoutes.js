const express = require("express");
const router = express.Router();
const { fight } = require("../controllers/combatController");
const { verifyJwt } = require("../middleware/auth");

// All combat routes require authentication
router.use(verifyJwt);

// POST /combat/fight - Execute combat between player and opponent (runs until completion)
router.post("/fight", fight);

module.exports = router;
