const pool = require("../config/db");

exports.getDashboard = async (req, res) => {
  try {
    // total vehicles
    const [total] = await pool.query("SELECT COUNT(*) as total FROM vehicles");

    // vehicle parked
    const [parked] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM vehicles 
      WHERE current_status = 'parked'
    `);

    // vehicles in today
    const [inToday] = await pool.query(`
      SELECT COUNT(*) as total
      FROM vehicle_movements
      WHERE movement_type = 'check_in'
      AND DATE(movement_time) = CURDATE()
    `);

    // vehicles out today
    const [outToday] = await pool.query(`
      SELECT COUNT(*) as total
      FROM vehicle_movements
      WHERE movement_type = 'check_out'
      AND DATE(movement_time) = CURDATE()
    `);

    // available slots
    const [availableSlots] = await pool.query(
      "SELECT COUNT(*) as total FROM warehouse_slots WHERE status = 'available'",
    );

    // slots count
    const [totalSlots] = await pool.query(
      "SELECT COUNT(*) as total FROM warehouse_slots",
    );

    // vehicles status (parked vs checked_out)
    const [status] = await pool.query(`
      SELECT movement_type, COUNT(*) as total
      FROM vehicle_movements
      GROUP BY movement_type
    `);

    res.json({
      totalVehicles: total[0].total,
      vehiclesParked: parked[0].total,
      vehiclesIn: inToday[0].total,
      vehiclesOut: outToday[0].total,
      availableSlots: availableSlots[0].total,
      totalSlots: totalSlots[0].total,
      status,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMovementChart = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        DATE(movement_time) AS date,
        SUM(CASE WHEN movement_type = 'check_in' THEN 1 ELSE 0 END) AS vehicles_in,
        SUM(CASE WHEN movement_type = 'check_out' THEN 1 ELSE 0 END) AS vehicles_out
      FROM vehicle_movements
      WHERE movement_time >= CURDATE() - INTERVAL 6 DAY
      GROUP BY DATE(movement_time)
      ORDER BY date
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load movement chart" });
  }
};

exports.getSlotsMap = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.id,
        s.slot_code,
        s.zone,
        CASE
          WHEN v.id IS NULL THEN 'available'
          ELSE 'occupied'
        END AS status,
        v.plate_number
      FROM warehouse_slots s
      LEFT JOIN vehicles v
        ON s.id = v.current_slot_id
        AND v.current_status = 'parked'
      ORDER BY s.zone, s.slot_code
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load slots map" });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.plate_number,
        vm.movement_type,
        vm.movement_time
      FROM vehicle_movements vm
      JOIN vehicles v ON vm.vehicle_id = v.id
      ORDER BY vm.movement_time DESC
      LIMIT 5
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

