const express = require("express");
const verifyToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const controller = require("../controllers/dashboard.controller");

const router = express.Router();

router.get("/", verifyToken, authorize(0), controller.getDashboard);

router.get(
  "/movement-chart",
  verifyToken,
  authorize(0),
  controller.getMovementChart
);

router.get(
  "/recent-activity",
  verifyToken,
  authorize(0),
  controller.getRecentActivity,
);

router.get("/slots-map", verifyToken, authorize(0), controller.getSlotsMap);
module.exports = router;
