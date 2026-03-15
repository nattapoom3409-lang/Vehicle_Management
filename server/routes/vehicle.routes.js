const express = require("express");
const verifyToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const controller = require("../controllers/vehicle.controller");

// const

const router = express.Router();

router.get("/", verifyToken, authorize(0), controller.getVehicles);

router.get(
  "/available-slots",
  verifyToken,
  authorize(0),
  controller.getAvailableSlots,
);
router.get("/types", verifyToken, authorize(0), controller.getVehicleTypes);

router.post("/", verifyToken, authorize(1), controller.addVehicle);

// action routes ก่อน
router.post("/:id/move-slot", verifyToken, authorize(1), controller.moveSlot);
router.post(
  "/:id/checkout",
  verifyToken,
  authorize(1),
  controller.checkoutVehicle,
);
router.post(
  "/:id/maintenance",
  verifyToken,
  authorize(1),
  controller.setMaintenance,
);
router.delete("/:id", verifyToken, authorize(3), controller.deleteVehicle);

router.post(
  "/:id/checkin",
  verifyToken,
  authorize(1),
  controller.checkinVehicle
);
// detail route ไว้ล่างสุด
router.get("/:id", verifyToken, authorize(0), controller.getVehicleDetail);

module.exports = router;