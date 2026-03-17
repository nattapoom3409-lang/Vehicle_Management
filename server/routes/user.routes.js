const express = require("express");
const verifyToken = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const controller = require("../controllers/user.controller");

const multer = require("multer");
const path = require("path");

const router = express.Router();

const fs = require("fs");

const uploadPath = "uploads/profiles";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ==========================
// ROUTES
// ==========================

// GET USERS
router.get("/", verifyToken, authorize(2), controller.getUsers);

// CREATE USER
router.post(
  "/",
  verifyToken,
  authorize(2),
  upload.single("profileImage"),
  controller.createUser
);

// UPDATE USER
router.put(
  "/:id",
  verifyToken,
  authorize(2),
  upload.single("profileImage"),
  controller.updateUser
);

// STATUS
router.patch(
  "/:id/status",
  verifyToken,
  authorize(2),
  controller.updateStatus
);

// DELETE
router.delete("/:id", verifyToken, authorize(3), controller.deleteUser);

router.get("/me", verifyToken, controller.getMe);

module.exports = router;