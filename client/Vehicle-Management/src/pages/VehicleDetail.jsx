import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./VehicleDetail.css";
import ReturnButton from "../components/common/ReturnButton";

function VehicleDetail() {
  const API_BASE = "http://localhost:3001";

  const { id } = useParams();
  const navigate = useNavigate();
  const { isVisitor, isEmployee, isAdmin } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [actionType, setActionType] = useState(""); // move | checkin

  useEffect(() => {
    fetchVehicleData();
  }, [id]);

  const fetchVehicleData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch vehicle");

      const data = await res.json();

      setVehicle(data.vehicle);
      setHistory(data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (type) => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/available-slots`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      setAvailableSlots(data);
      setSelectedSlot("");
      setActionType(type);
      setShowSlotModal(true);
    } catch {
      alert("Failed to fetch available slots");
    }
  };

  const handleConfirmSlot = async () => {
    if (!selectedSlot) return alert("Please select slot");

    let endpoint = "";

    if (actionType === "move") {
      endpoint = `/api/vehicles/${id}/move-slot`;
    }

    if (actionType === "checkin") {
      endpoint = `/api/vehicles/${id}/checkin`;
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          new_slot_id: selectedSlot,
          slot_id: selectedSlot,
        }),
      });

      if (res.ok) {
        setShowSlotModal(false);
        fetchVehicleData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    if (!window.confirm("Confirm checkout?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/vehicles/${id}/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) fetchVehicleData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMaintenance = async () => {
    const reason = prompt("Enter maintenance reason");
    if (!reason) return;

    try {
      const res = await fetch(`${API_BASE}/api/vehicles/${id}/maintenance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (res.ok) fetchVehicleData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this vehicle?")) return;

    const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.ok) navigate("/vehicles");
  };

  if (loading) return <div>Loading...</div>;
  if (!vehicle) return <div>Vehicle not found</div>;

  return (
    <div className="vehicle-detail-container">
      <div className="vehicle-detail-header">
        <h1>Vehicle Detail</h1>

        <ReturnButton
          onClick={() => navigate("/vehicles")}
          className="return-btn"
        />
      </div>

      <div className="detail-card-group">
        <div className="detail-card-section">
          <div className="detail-card">
            <h3>Vehicle Picture</h3>
            <img
              src={`${API_BASE}/uploads/vehicles/${vehicle.image}`}
              className="vehicle-picture"
            />
          </div>
        </div>
        <div className="detail-card-section">
          {/* Vehicle Info */}
          <div className="detail-card">
            <h2>Vehicle Info</h2>

            <div className="detail-grid">
              <div>
                <label>Plate Number</label>
                <p>{vehicle.plate_number}</p>
              </div>

              <div>
                <label>Vehicle Type</label>
                <p>{vehicle.vehicle_type}</p>
              </div>

              <div>
                <label>Brand</label>
                <p>{vehicle.brand}</p>
              </div>

              <div>
                <label>Model</label>
                <p>{vehicle.model}</p>
              </div>

              <div>
                <label>Color</label>
                <p>{vehicle.color}</p>
              </div>

              <div>
                <label>Status</label>
                <p className={`status ${vehicle.current_status}`}>
                  {vehicle.current_status}
                </p>
              </div>

              <div>
                <label>Current Slot</label>
                <p>{vehicle.slot_code || "-"}</p>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="detail-card">
            <h2>Owner</h2>

            <div className="detail-grid">
              <div>
                <label>Name</label>
                <p>{vehicle.owner_name}</p>
              </div>

              <div>
                <label>Phone</label>
                <p>{vehicle.owner_phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-card-section">
          {/* HISTORY */}
          <div className="detail-card">
            <h2>Parking History</h2>

            <div className="history-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Slot</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item, i) => (
                    <tr key={i}>
                      <td>{item.movement_type.replace("_", " ")}</td>
                      <td>{item.slot_code || "-"}</td>
                      <td>{new Date(item.movement_time).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maintenance */}
          {vehicle.current_status === "maintenance" && (
            <div className="detail-card maintenance-note">
              <h3>Maintenance Reason</h3>
              <p>{vehicle.maintenance_reason}</p>
            </div>
          )}
        </div>
      </div>

      <div className="detail-button-group">
        {/* ACTION BUTTONS */}
        {!isVisitor && (
          <div className="action-buttons">
            {/* parked */}
            {isEmployee && vehicle.current_status === "parked" && (
              <>
                <button
                  className="btn move-slot"
                  onClick={() => fetchSlots("move")}
                >
                  Move Slot
                </button>

                <button className="btn checkout" onClick={handleCheckout}>
                  Checkout
                </button>

                <button className="btn maintenance" onClick={handleMaintenance}>
                  Maintenance
                </button>
              </>
            )}

            {/* checked out */}
            {isEmployee && vehicle.current_status === "checked_out" && (
              <button
                className="btn checkin"
                onClick={() => fetchSlots("checkin")}
              >
                Check In
              </button>
            )}

            {/* maintenance */}
            {isEmployee && vehicle.current_status === "maintenance" && (
              <button
                className="btn checkin"
                onClick={() => fetchSlots("checkin")}
              >
                Return to Parking
              </button>
            )}

            {isAdmin && (
              <button className="btn delete" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        )}

        {/* SLOT MODAL */}
        {showSlotModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowSlotModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Select Slot</h2>

              <div className="modal-dropdown">
                <div
                  className="dropdown-selected"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  {selectedSlot
                    ? availableSlots.find((s) => s.id == selectedSlot)
                        ?.slot_number
                    : "-- Select Slot --"}
                </div>

                {openDropdown && (
                  <div className="dropdown-menu">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedSlot(slot.id);
                          setOpenDropdown(false);
                        }}
                      >
                        {slot.slot_number}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={handleConfirmSlot}>Confirm</button>
                <button onClick={() => setShowSlotModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleDetail;
