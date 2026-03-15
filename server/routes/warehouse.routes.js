const express = require("express");
const verifyToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const controller = require("../controllers/warehouse.controller");
const roles = require("../config/role");

const router = express.Router();

// กำหนดให้เฉพาะ Role ที่มีค่าเป็น 0 (เช่น Admin) เข้าถึงข้อมูลแผนผังคลังสินค้าได้
router.get("/", verifyToken, authorize(0), controller.getWarehouse);

module.exports = router;