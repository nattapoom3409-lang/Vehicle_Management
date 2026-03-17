import React, { useState, useEffect } from "react";
import SearchBar from "../components/common/SearchBar";
import AddVehicle from "../components/vehicle/AddVehicle";
import { useAuth } from "../hooks/useAuth";
import VehicleTable from "../components/vehicle/VehicleTable";
import Pagination from "../components/common/Pagination";
import "./Vehicles.css";

function Vehicle() {
    const API_BASE = "http://localhost:3001";
  const { isEmployee, isManager } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({ text: "", filters: {} });
const [vehicleTypes, setVehicleTypes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const vehiclesPerPage = 10;

  const indexOfLast = currentPage * vehiclesPerPage;
  const indexOfFirst = indexOfLast - vehiclesPerPage;

  const totalPages = Math.ceil(vehicles.length / vehiclesPerPage);

  const currentVehicles = vehicles.slice(indexOfFirst, indexOfLast);
const filters = [
  {
    label: "Status",
    options: ["parked", "checked_out", "maintenance", "overdue"],
  },
  {
    label: "Vehicle Type",
    options: vehicleTypes.map((t) => t.name), // ✅ dynamic
  },
];

const typeToId = (typeName) => {
  const found = vehicleTypes.find((t) => t.name === typeName);
  return found?.id;
};

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const { text, filters: selectedFilters } = searchParams;

      const query = new URLSearchParams();

      if (text) query.append("search", text);

      if (selectedFilters["Status"]?.length) {
        query.append("status", selectedFilters["Status"].join(","));
      }

      if (selectedFilters["Vehicle Type"]?.length) {
        const typeIds = selectedFilters["Vehicle Type"].map((name) =>
          typeToId(name),
        );
        query.append("type", typeIds.join(","));
      }

      const res = await fetch(
        `${API_BASE}/api/vehicles?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Failed to fetch vehicles");

      const data = await res.json();
      setVehicles(data);
    } catch (error) {
      console.error("Fetch vehicles error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params) => {
    setSearchParams((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(params)) {
        return prev; // ไม่ update ถ้าค่าเหมือนเดิม
      }
      setCurrentPage(1);
      return params;
    });
  };

  useEffect(() => {
    fetchVehicles();
  }, [searchParams]);

  useEffect(() => {
  const fetchTypes = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/vehicles/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setVehicleTypes(data);
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
    }
  };

  fetchTypes();
}, []);

  return (
    <div className="vehicle-container">
      {isEmployee && <AddVehicle onVehicleAdded={fetchVehicles} />}

      <h1 className="title">Vehicle List</h1>

      <SearchBar filters={filters} onSearch={handleSearch} />

      <VehicleTable
        vehicles={currentVehicles}
        loading={loading}
        canEditVehicle={isEmployee}
      />

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
}

export default Vehicle;
