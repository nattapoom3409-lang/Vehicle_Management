const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1️⃣ หา user
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = rows[0];

    // 2️⃣ เช็ครหัสผ่าน
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Account is inactive. Please contact admin.",
      });
    }
    // 3️⃣ สร้าง token
    const token = jwt.sign(
      {
        id: user.id,
        access_level: user.access_level,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        access_level: user.access_level,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
