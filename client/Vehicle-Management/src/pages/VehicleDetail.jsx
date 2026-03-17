import React, { useEffect, useState, useRef } from "react";
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
  const [editForm, setEditForm] = useState({
    plate_number: "",
    vehicle_type_id: "",
    brand: "",
    model: "",
    color: "",
    owner_name: "",
    owner_phone: "",
  });
  const [openEditInfo, setOpenEditInfo] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [actionType, setActionType] = useState(""); // move | checkin
  const [openTypeDropdown, setOpenTypeDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchVehicleData();
    fetchVehicleTypes();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const fetchVehicleTypes = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/types`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      setVehicleTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setOpenEditInfo(false);
        fetchVehicleData();
      } else {
        alert("Update failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmSlot = async () => {
    if (!selectedSlot) return alert("Please select slot");

    let endpoint = "";
    let body = {};

    if (actionType === "move") {
      endpoint = `/api/vehicles/${id}/move-slot`;
      body = { new_slot_id: selectedSlot };
    }

    if (actionType === "checkin") {
      endpoint = `/api/vehicles/${id}/checkin`;
      body = { slot_id: selectedSlot };
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
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
            <h2>Vehicle Picture</h2>
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
                <p>{vehicle.slot_code || "-"}
                    
                </p>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="detail-card">
            <h2>Owner Info</h2>

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
                  className="btn edit-info"
                  onClick={() => {
                    setEditForm({
                      plate_number: vehicle.plate_number,
                      vehicle_type_id: vehicle.vehicle_type_id,
                      brand: vehicle.brand,
                      model: vehicle.model,
                      color: vehicle.color,
                      owner_name: vehicle.owner_name,
                      owner_phone: vehicle.owner_phone,
                    });
                    setOpenEditInfo(true);
                  }}
                >
                  Edit Info
                </button>
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

            {/* maintenance */}
            {isEmployee && vehicle.current_status === "maintenance" && (
              <button
                className="btn checkin"
                onClick={() => fetchSlots("checkin")}
              >
                Return to Parking
              </button>
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

        {openEditInfo && (
          <div
            className="edit-info-overlay"
            onClick={() => setOpenEditInfo(false)}
          >
            <div
              className="edit-info-container"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOpenEditInfo(false)}
                className="close-btn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-x-icon lucide-x"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>

              <h2>Edit Info ({vehicle.plate_number})</h2>

              <div>
                <h3>Vehicle Info</h3>
                <div className="edit-grid">
                  <div className="input-group">
                    <input
                      name="plate_number"
                      value={editForm.plate_number}
                      onChange={handleChange}
                      placeholder="Plate Number"
                    />
                    <label>Plate Number</label>
                  </div>

                  <div className="input-group">
                    <div
                      className={`custom-dropdown ${openTypeDropdown ? "active" : ""}`}
                      ref={dropdownRef}
                    >
                      <div
                        className={`dropdown-selected ${openTypeDropdown ? "active" : ""}`}
                        onClick={() => setOpenTypeDropdown(!openTypeDropdown)}
                      >
                        {editForm.vehicle_type_id
                          ? vehicleTypes.find(
                              (t) => t.id == editForm.vehicle_type_id,
                            )?.name
                          : "-- Select Vehicle Type --"}

                        <span className="arrow">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-chevron-down-icon lucide-chevron-down"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </div>

                      {openTypeDropdown && (
                        <div className="dropdown-menu">
                          {vehicleTypes.map((type) => (
                            <div
                              key={type.id}
                              className="dropdown-item"
                              onClick={() => {
                                setEditForm({
                                  ...editForm,
                                  vehicle_type_id: type.id,
                                });
                                setOpenTypeDropdown(false);
                              }}
                            >
                              {type.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <label>Vehicle Type</label>
                  </div>

                  <div className="input-group">
                    <input
                      name="brand"
                      value={editForm.brand}
                      onChange={handleChange}
                      placeholder="Brand"
                    />
                    <label>Brand</label>
                  </div>

                  <div className="input-group">
                    <input
                      name="model"
                      value={editForm.model}
                      onChange={handleChange}
                      placeholder="Model"
                    />
                    <label>Model</label>
                  </div>

                  <div className="input-group">
                    <input
                      name="color"
                      value={editForm.color}
                      onChange={handleChange}
                      placeholder="Color"
                    />
                    <label>Color</label>
                  </div>
                </div>
              </div>

              <div>
                <h3>Owner Info</h3>
                <div className="edit-grid">
                  <div className="input-group">
                    <input
                      name="owner_name"
                      value={editForm.owner_name}
                      onChange={handleChange}
                      placeholder="Owner Name"
                    />
                    <label>Owner Name</label>
                  </div>

                  <div className="input-group">
                    <input
                      name="owner_phone"
                      value={editForm.owner_phone}
                      onChange={handleChange}
                      placeholder="Phone"
                    />
                    <label>Phone Number</label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={handleUpdate}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VehicleDetail;
