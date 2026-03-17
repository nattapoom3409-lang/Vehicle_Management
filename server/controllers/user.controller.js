const db = require("../config/db");
const bcrypt = require("bcryptjs");
const roles = require("../config/role");

// ==========================
// GET USERS
// ==========================
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT 
  id,
  username,
  email,
  first_name,
  last_name,
  access_level,
  status,
  profile_image,
  created_at
FROM users`,
    );

    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
};

// ==========================
// CREATE USER
// ==========================
// ... (code ส่วนบนเหมือนเดิม)

exports.createUser = async (req, res) => {
  const { username, email, password, first_name, last_name, access_level } =
    req.body;

  const profileImage = req.file ? req.file.filename : null;

  try {
    // 1. Validation ต่างๆ (ข้ามไปส่วน hash)
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ... (ส่วนเช็ค Role และ Existing Email เหมือนเดิม)

    // 2. การ Hash รหัสผ่านแบบเดียวกับ hash.js
    const SALT_ROUNDS = 10;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. บันทึกลง Database
    await db.query(
      `INSERT INTO users 
      (username,email,password,first_name,last_name,access_level,profile_image) 
      VALUES (?,?,?,?,?,?,?)`,
      [
        username,
        email,
        hashedPassword,
        first_name,
        last_name,
        access_level,
        profileImage,
      ]
    );

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ... (ส่วนที่เหลือเหมือนเดิม)

// ==========================
// UPDATE USER
// ==========================
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, first_name, last_name, access_level } = req.body;
  
  // Only capture the filename if a new file was actually uploaded
  const newProfileImage = req.file ? req.file.filename : null;

  try {
    // ... (Your existing role validation logic)

    // Build the query dynamically so we don't overwrite with NULL
    let query = `UPDATE users SET username=?, email=?, first_name=?, last_name=?, access_level=?`;
    let params = [username, email, first_name, last_name, access_level];

    if (newProfileImage) {
      query += `, profile_image=?`;
      params.push(newProfileImage);
    }

    query += ` WHERE id=?`;
    params.push(id);

    await db.query(query, params);
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [[targetUser]] = await db.query(
      "SELECT access_level FROM users WHERE id=?",
      [id],
    );

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const requesterLevel = roles[req.user.access_level];
    const targetLevel = roles[targetUser.access_level];

    // manager เปลี่ยนได้แค่ visitor / employee
    if (requesterLevel === roles.manager && targetLevel >= roles.manager) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // admin เปลี่ยนได้ถึง manager
    if (requesterLevel < roles.manager) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await db.query("UPDATE users SET status=? WHERE id=?", [status, id]);

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ==========================
// DELETE USER
// ==========================
exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // ✅ ป้องกันลบตัวเอง
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await db.query("DELETE FROM users WHERE id=?", [id]);

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const [[user]] = await db.query(
      `SELECT id, username, email, first_name, last_name, 
              access_level, status, profile_image 
       FROM users WHERE id = ?`,
      [req.user.id]  // req.user comes from your JWT middleware
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};
