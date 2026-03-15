const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const paymentController = require("../controllers/payment.controller");

// ดู payment ทั้งหมด
router.get("/", verifyToken, authorize(0, 1), paymentController.getAllPayments);

// ดู payment ของรถคันหนึ่ง
router.get(
  "/:vehicle_id",
  verifyToken,
  authorize(0, 1),
  paymentController.getPaymentByVehicle
);

module.exports = router;