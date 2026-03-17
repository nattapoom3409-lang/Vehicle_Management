require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path"); // เพิ่ม path module สำหรับจัดการ directory

const authRoutes = require("./routes/auth.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const warehouseRoutes = require("./routes/warehouse.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/users", userRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
