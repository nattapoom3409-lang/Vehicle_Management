import React, { useState, useEffect } from "react";
import SearchBar from "../components/common/SearchBar";
import "./Warehouse.css";

function Warehouse() {
    const API_BASE = "http://localhost:3001";
  const [slots, setSlots] = useState([]);
  const [searchParams, setSearchParams] = useState({ text: "", filters: {} });

  const warehouseFilters = [
    { label: "Status", options: ["available", "occupied"] },
    { label: "Zone", options: ["A", "B", "C"] },
  ];

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/api/warehouse`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setSlots(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchSlots();
  }, []);

  const filteredSlots = slots.filter((slot) => {
    const searchText = searchParams.text.toLowerCase();

    const matchesSearch =
      slot.slot_code.toLowerCase().includes(searchText) ||
      (slot.plate_number &&
        slot.plate_number.toLowerCase().includes(searchText));

    const selectedStatus = searchParams.filters["Status"] || [];
    const selectedZones = searchParams.filters["Zone"] || [];

    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(slot.status);

    const matchesZone =
      selectedZones.length === 0 || selectedZones.includes(slot.zone);

    return matchesSearch && matchesStatus && matchesZone;
  });

  const zones = ["A", "B", "C"];

  return (
    <div className="warehouse-container">
      <h1>Warehouse Map</h1>

      <SearchBar
        filters={warehouseFilters}
        onSearch={setSearchParams}
      />

      {zones.map((zone) => {
        const slotsInZone = filteredSlots.filter((s) => s.zone === zone);

        if (slotsInZone.length === 0) return null;

        return (
          <div key={zone} className="zone-section">
            <h2>Zone {zone}</h2>

            <div className="slots-grid">
              {slotsInZone.map((slot) => (
                <div key={slot.id} className={`slot-card ${slot.status}`}>
                  <div className="slot-header">
                    <span className="code">{slot.slot_code}</span>
                    <span className="status-dot"></span>
                  </div>

                  {slot.status === "occupied" ? (
                    <div className="vehicle-mini-info">
                      <p className="plate">{slot.plate_number}</p>
                      <p className="model">{slot.brand}</p>
                    </div>
                  ) : (
                    <div className="empty-label">Available</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Warehouse;