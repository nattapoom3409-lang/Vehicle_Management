require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
// const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const warehouseRoutes = require("./routes/warehouse.routes");

// const slotRoutes = require("./routes/slot.routes");
// const movementRoutes = require("./routes/movement.routes");
// const paymentRoutes = require("./routes/payment.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/warehouse", warehouseRoutes);

// app.use("/api/slots", slotRoutes);
// app.use("/api/movements", movementRoutes);
// app.use("/api/payments", paymentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
