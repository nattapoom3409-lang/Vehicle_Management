const pool = require("../config/db");

// เปลี่ยนชื่อให้ตรงกับ router.get("/", ..., controller.getWarehouse)
exports.getWarehouse = async (req, res) => {
  try {
    // ใช้ LEFT JOIN เพื่อดึงข้อมูล slot และรถที่จอดอยู่ (ถ้ามี)
    const [slots] = await pool.query(`
      SELECT 
        s.id, 
        s.slot_code, 
        s.zone, 
        s.status,
        v.plate_number,
        v.brand,
        v.model
      FROM warehouse_slots s
      LEFT JOIN vehicles v ON s.id = v.current_slot_id
      ORDER BY s.zone ASC, s.slot_code ASC
    `);

    res.json(slots);
  } catch (error) {
    console.error("Warehouse Controller Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};