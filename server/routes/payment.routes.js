const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const slotController = require("../controllers/slot.controller");

// ดูช่องทั้งหมด (ทุก role ที่ login)
router.get("/", verifyToken, slotController.getAllSlots);

// สร้างช่อง (admin / manager)
router.post("/", verifyToken, authorize(0, 1), slotController.createSlot);

// แก้ไขช่อง
router.put("/:id", verifyToken, authorize(0, 1), slotController.updateSlot);

// ลบช่อง
router.delete("/:id", verifyToken, authorize(0), slotController.deleteSlot);

module.exports = router;