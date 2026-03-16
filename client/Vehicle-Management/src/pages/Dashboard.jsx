import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

function Dashboard() {
  const API_BASE = "http://localhost:3001";

  const [data, setData] = useState(null);
  const [movementChart, setMovementChart] = useState([]);
  const [activity, setActivity] = useState([]);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setData(result);
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    const fetchChart = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/dashboard/movement-chart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setMovementChart(result);
    };

    fetchChart();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/dashboard/slots-map`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setSlots(result);
    };

    fetchSlots();
  }, []);

  useEffect(() => {
    const fetchActivity = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/dashboard/recent-activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      setActivity(result);
    };

    fetchActivity();
  }, []);

  if (!data) return <div>Loading...</div>;

  const totalMovement = data.vehiclesIn + data.vehiclesOut;

  const inPercent = totalMovement ? (data.vehiclesIn / totalMovement) * 100 : 0;
  const outPercent = totalMovement
    ? (data.vehiclesOut / totalMovement) * 100
    : 0;

  const slotPercent = data.totalSlots
    ? (data.availableSlots / data.totalSlots) * 100
    : 0;

  return (
    <div className="dashboard-container">
      <div className="dashboard-container1">
        {/* Total Vehicle */}
        <div className="dashboard-card1">
          <div className="card-title">Total Vehicles</div>
          <div className="count">{data.totalVehicles}</div>
        </div>

        {/* Vehicles Parked */}
        <div className="dashboard-card1">
          <div className="card-title bar">Vehicles Parked</div>
          <div className="count">{data.vehiclesParked}</div>
        </div>

        {/* Vehicles Movement Today */}
        <div className="dashboard-card1">
          <div className="card-title bar">Vehicles Movement Today</div>

          <div className="movement-chart">
            <div className="bar-row">
              <div className="bar-label">IN</div>

              <div className="bar-container">
                <div
                  className="bar in"
                  style={{ width: `${inPercent}%` }}
                ></div>
              </div>

              <div>
                {data.vehiclesIn} ({inPercent.toFixed(0)}%)
              </div>
            </div>

            <div className="bar-row">
              <div className="bar-label">OUT</div>

              <div className="bar-container">
                <div
                  className="bar out"
                  style={{ width: `${outPercent}%` }}
                ></div>
              </div>

              <div>
                {data.vehiclesOut} ({outPercent.toFixed(0)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Available slots */}
        <div className="dashboard-card1">
          <div className="card-title">Avialable Slots</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${slotPercent}%` }}
            ></div>
          </div>
          <div className="slot-text">
            {data.availableSlots} / {data.totalSlots}
          </div>
        </div>
      </div>
      <div className="dashboard-container2">
        <div className="dashboard-card2">
          <h2>Vehicle Movement Chart</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={movementChart}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })
                }
              />

              <YAxis allowDecimals={false} />

              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />

              <Line
                type="monotone"
                dataKey="vehicles_in"
                stroke="limegreen"
                strokeWidth={3}
                name="IN"
              />

              <Line
                type="monotone"
                dataKey="vehicles_out"
                stroke="red"
                strokeWidth={3}
                name="OUT"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="dashboard-container3">
        <div className="dashboard-card3">
          <h2>Parking Slots Map</h2>
          <div className="slots-box">
            <div className="slots-map">
              {Array.isArray(slots) &&
                slots.map((slot) => (
                  <div key={slot.id} className={`slot ${slot.status}`}>
                    {slot.slot_code}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="dashboard-card3">
          <h2>Recent Activity</h2>
          <div className="activity-log">
            {activity.map((a, i) => (
              <div key={i} className="activity-row">
                <div>
                  <span>{a.plate_number}</span>
                  {" - "}
                  <span className={a.movement_type}>
                    {a.movement_type === "check_in"
                      ? "IN"
                      : a.movement_type === "check_out"
                        ? "OUT"
                        : "MOVE"}
                  </span>
                </div>
                <span>
                  {new Date(a.movement_time).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
