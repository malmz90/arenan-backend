const express = require("express");
const router = express.Router();
const characterController = require("../controllers/characterController");
const { verifyJwt } = require("../middleware/auth");

router.post("/create", verifyJwt, characterController.createCharacter);
router.post("/equip", verifyJwt, characterController.handleEquipItem);
router.post("/unequip", verifyJwt, characterController.handleUnequipItem);
router.get("/equipment", verifyJwt, characterController.getEquipment);
router.get("/inventory", verifyJwt, characterController.getInventory);
router.get("/all", characterController.getAllCharacters); // Public endpoint to view all characters
router.get("/stats", verifyJwt, characterController.getStats);

module.exports = router;
