const pool = require("../config/db");

exports.getVehicles = async (req, res) => {
  try {
    // console.log("QUERY:", req.query);

    const { search, status, type } = req.query;

    let query = `
       SELECT 
        v.id,
        v.plate_number,
        v.brand,
        v.model,
        v.color,
        v.current_status,
        t.type_name AS vehicle_type,
        s.slot_code AS current_slot
        FROM vehicles v
        LEFT JOIN vehicle_types t 
        ON v.vehicle_type_id = t.id
        LEFT JOIN warehouse_slots s 
        ON v.current_slot_id = s.id
        WHERE 1=1
    `;

    const params = [];

    if (search) {
      query +=
        " AND (v.plate_number LIKE ? OR v.brand LIKE ? OR v.model LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      const statusList = status.split(",").filter(Boolean);

      if (statusList.length) {
        query += ` AND v.current_status IN (${statusList.map(() => "?").join(",")})`;
        params.push(...statusList);
      }
    }

    if (type) {
      const typeList = type.split(",").filter(Boolean);

      if (typeList.length) {
        query += ` AND v.vehicle_type_id IN (${typeList.map(() => "?").join(",")})`;
        params.push(...typeList);
      }
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Updated: Match SQL column 'type_name'
exports.getVehicleTypes = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, type_name AS name FROM vehicle_types",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Updated: Match SQL column 'slot_code'
exports.getAvailableSlots = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, slot_code AS slot_number FROM warehouse_slots WHERE status='available' ORDER BY slot_code ASC",
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// New: Handle the POST request from AddVehicle.jsx
exports.addVehicle = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      plate_number,
      brand,
      model,
      color,
      vehicle_type_id,
      owner_name,
      owner_phone,
      slot_id,
    } = req.body;

    // ดึง user id จาก token (ที่ถูกถอดรหัสผ่าน middleware มาแล้ว)
    const userId = req.user ? req.user.id : null;

    // 1. Insert ข้อมูลรถใหม่
    const [result] = await connection.query(
      `INSERT INTO vehicles (plate_number, brand, model, color, vehicle_type_id, owner_name, owner_phone, current_slot_id, current_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'parked')`,
      [
        plate_number,
        brand,
        model,
        color,
        vehicle_type_id,
        owner_name,
        owner_phone,
        slot_id,
      ],
    );

    const newVehicleId = result.insertId;

    // 2. บันทึกประวัติการเคลื่อนไหว (Movement) เพื่อเก็บ "เวลาที่จอด"
    // ใช้ movement_time เป็น CURRENT_TIMESTAMP อัตโนมัติ
    await connection.query(
      `INSERT INTO vehicle_movements (vehicle_id, slot_id, handled_by, movement_type, movement_time) 
       VALUES (?, ?, ?, 'check_in', NOW())`,
      [newVehicleId, slot_id, userId],
    );

    // 3. อัปเดตสถานะช่องจอดเป็น 'occupied'
    if (slot_id) {
      await connection.query(
        "UPDATE warehouse_slots SET status = 'occupied' WHERE id = ?",
        [slot_id],
      );
    }

    await connection.commit();
    res.status(201).json({
      message: "Vehicle added and check-in time recorded successfully",
      id: newVehicleId,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Database error" });
  } finally {
    connection.release();
  }
};

exports.getVehicleDetail = async (req, res) => {
  try {
    const vehicleId = req.params.id;

    const [vehicle] = await pool.query(
      `
      SELECT 
        v.*,
        t.type_name AS vehicle_type,
        s.slot_code
      FROM vehicles v
      LEFT JOIN vehicle_types t ON v.vehicle_type_id = t.id
      LEFT JOIN warehouse_slots s ON v.current_slot_id = s.id
      WHERE v.id = ?
      `,
      [vehicleId],
    );

    if (!vehicle.length) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const [history] = await pool.query(
      `
      SELECT 
        vm.movement_type,
        vm.movement_time,
        ws.slot_code
      FROM vehicle_movements vm
      LEFT JOIN warehouse_slots ws ON vm.slot_id = ws.id
      WHERE vm.vehicle_id = ?
      ORDER BY vm.movement_time DESC
      `,
      [vehicleId],
    );

    res.json({
      vehicle: vehicle[0],
      history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.moveSlot = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const vehicleId = req.params.id;
    const { new_slot_id } = req.body;
    const userId = req.user ? req.user.id : null;

    const [vehicle] = await connection.query(
      "SELECT current_slot_id FROM vehicles WHERE id=?",
      [vehicleId],
    );

    const oldSlot = vehicle[0].current_slot_id;

    await connection.query("UPDATE vehicles SET current_slot_id=? WHERE id=?", [
      new_slot_id,
      vehicleId,
    ]);

    await connection.query(
      `INSERT INTO vehicle_movements 
       (vehicle_id, slot_id, handled_by, movement_type)
       VALUES (?, ?, ?, 'move_slot')`,
      [vehicleId, new_slot_id, userId],
    );

    await connection.query(
      "UPDATE warehouse_slots SET status='available' WHERE id=?",
      [oldSlot],
    );

    await connection.query(
      "UPDATE warehouse_slots SET status='occupied' WHERE id=?",
      [new_slot_id],
    );

    await connection.commit();

    res.json({ message: "Slot moved successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: "Database error" });
  } finally {
    connection.release();
  }
};

exports.checkoutVehicle = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const vehicleId = req.params.id;
    const userId = req.user ? req.user.id : null;

    const [vehicle] = await connection.query(
      "SELECT current_slot_id FROM vehicles WHERE id=?",
      [vehicleId],
    );

    const slotId = vehicle[0].current_slot_id;

    await connection.query(
      "UPDATE vehicles SET current_status='checked_out', current_slot_id=NULL WHERE id=?",
      [vehicleId],
    );

    await connection.query(
      `INSERT INTO vehicle_movements 
       (vehicle_id, slot_id, handled_by, movement_type)
       VALUES (?, ?, ?, 'check_out')`,
      [vehicleId, slotId, userId],
    );

    await connection.query(
      "UPDATE warehouse_slots SET status='available' WHERE id=?",
      [slotId],
    );

    await connection.commit();

    res.json({ message: "Vehicle checked out" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: "Database error" });
  } finally {
    connection.release();
  }
};

exports.setMaintenance = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { reason } = req.body;

    await pool.query(
      `
      UPDATE vehicles 
      SET current_status='maintenance',
      maintenance_reason=?
      WHERE id=?
      `,
      [reason, vehicleId],
    );

    res.json({ message: "Vehicle set to maintenance" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteVehicle = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const vehicleId = req.params.id;

    // 1. หา slot ของรถ
    const [vehicle] = await connection.query(
      "SELECT current_slot_id FROM vehicles WHERE id=?",
      [vehicleId]
    );

    if (!vehicle.length) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const slotId = vehicle[0].current_slot_id;

    // 2. ลบ vehicle
    await connection.query(
      "DELETE FROM vehicles WHERE id=?",
      [vehicleId]
    );

    // 3. คืน slot
    if (slotId) {
      await connection.query(
        "UPDATE warehouse_slots SET status='available' WHERE id=?",
        [slotId]
      );
    }

    await connection.commit();

    res.json({ message: "Vehicle deleted and slot released" });

  } catch (err) {

    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Server error" });

  } finally {
    connection.release();
  }
};

exports.checkinVehicle = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const vehicleId = req.params.id;
    const { slot_id } = req.body;
    const userId = req.user ? req.user.id : null;

    const [vehicle] = await connection.query(
      "SELECT current_status FROM vehicles WHERE id=?",
      [vehicleId],
    );

    if (!vehicle.length) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // update vehicle
    await connection.query(
      `UPDATE vehicles 
       SET current_status='parked',
           current_slot_id=?,
           maintenance_reason=NULL
       WHERE id=?`,
      [slot_id, vehicleId],
    );

    // movement history
    await connection.query(
      `INSERT INTO vehicle_movements
       (vehicle_id, slot_id, handled_by, movement_type)
       VALUES (?, ?, ?, 'check_in')`,
      [vehicleId, slot_id, userId],
    );

    // update slot
    await connection.query(
      "UPDATE warehouse_slots SET status='occupied' WHERE id=?",
      [slot_id],
    );

    await connection.commit();

    res.json({ message: "Vehicle checked in again" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: "Database error" });
  } finally {
    connection.release();
  }
};
