import React, { useEffect, useState, useRef } from "react";
import "./addVehicle.css";

function AddVehicle({ onClose }) {
  const [form, setForm] = useState({
    plate_number: "",
    brand: "",
    model: "",
    color: "",
    vehicle_type_id: "",
    owner_name: "",
    owner_phone: "",
    slot_id: "",
  });

  const [slots, setSlots] = useState([]);
  const [types, setTypes] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openType, setOpenType] = useState(false);
  const [openSlot, setOpenSlot] = useState(false);

  const [image, setImage] = useState(null);
  const typeRef = useRef(null);
  const slotRef = useRef(null);

  // Get token from localStorage (standard practice for your verifyToken middleware)
  const token = localStorage.getItem("token");

  const fetchOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    // Fetch slots and map 'slot_code' to 'slot_number' for UI consistency
    fetch("http://localhost:3001/api/vehicles/available-slots", fetchOptions)
      .then((res) => res.json())
      .then((data) => setSlots(data))
      .catch((err) => console.error("Error loading slots:", err));

    // Fetch types and map 'type_name' to 'name'
    fetch("http://localhost:3001/api/vehicles/types", fetchOptions)
      .then((res) => res.json())
      .then((data) => setTypes(data))
      .catch((err) => console.error("Error loading types:", err));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target))
        setOpenType(false);
      if (slotRef.current && !slotRef.current.contains(e.target))
        setOpenSlot(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      plate_number: "",
      brand: "",
      model: "",
      color: "",
      vehicle_type_id: "",
      owner_name: "",
      owner_phone: "",
      slot_id: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.slot_id || !form.vehicle_type_id) {
      alert("Please select both a Vehicle Type and a Parking Slot.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("plate_number", form.plate_number);
      formData.append("brand", form.brand);
      formData.append("model", form.model);
      formData.append("color", form.color);
      formData.append("vehicle_type_id", form.vehicle_type_id);
      formData.append("owner_name", form.owner_name);
      formData.append("owner_phone", form.owner_phone);
      formData.append("slot_id", form.slot_id);
      formData.append("vehicleImage", image);

      const response = await fetch("http://localhost:3001/api/vehicles", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        resetForm();
        setOpenAdd(false);
        if (onClose) onClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  return (
    <div>
      <div
        className={`add-btn ${openAdd ? "active" : ""}`}
        onClick={() => setOpenAdd(true)}
      >
        <div className="add-btn-title">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </span>
          add vehicle
        </div>
      </div>

      {openAdd && (
        <div className="add-vehicle-overlay" onClick={() => setOpenAdd(false)}>
          <div
            className="add-vehicle-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="close-overlay-btn"
              onClick={() => setOpenAdd(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-x"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
            <h1>Add Vehicle</h1>

            <form className="add-vehicle-form" onSubmit={handleSubmit}>
              <div className="add-vehicle-input">
                <div className="add-vehicle-info">
                  <h2>Vehicle Info</h2>
                  <div className="input-container">
                    <div className="input-form">
                      <input
                        name="plate_number"
                        className="input-box"
                        placeholder=" "
                        value={form.plate_number}
                        onChange={handleChange}
                        required
                      />
                      <label>Plate Number</label>
                    </div>
                    <div className="input-form">
                      <input
                        name="brand"
                        className="input-box"
                        placeholder=" "
                        value={form.brand}
                        onChange={handleChange}
                        required
                      />
                      <label>Brand</label>
                    </div>
                    <div className="input-form">
                      <input
                        name="model"
                        className="input-box"
                        placeholder=" "
                        value={form.model}
                        onChange={handleChange}
                        required
                      />
                      <label>Model</label>
                    </div>
                    <div className="input-form">
                      <input
                        name="color"
                        className="input-box"
                        placeholder=" "
                        value={form.color}
                        onChange={handleChange}
                      />
                      <label>Color</label>
                    </div>

                    {/* Vehicle Type Dropdown */}
                    <div className="select-form ">
                      <div className="select-form-group" ref={typeRef}>
                        <div
                          className={`dropdown-title ${openType ? "active" : ""}`}
                          onClick={() => setOpenType(!openType)}
                        >
                          {form.vehicle_type_id
                            ? types.find(
                                (t) => t.id === Number(form.vehicle_type_id),
                              )?.name
                            : "Select Vehicle Type"}
                        </div>
                        <label>Vehicle Type</label>

                        {openType && (
                          <div className="dropdown">
                            {types.map((type) => (
                              <div
                                key={type.id}
                                className="dropdown-item"
                                onClick={() => {
                                  setForm({
                                    ...form,
                                    vehicle_type_id: type.id,
                                  });
                                  setOpenType(false);
                                }}
                              >
                                {type.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Picture */}
                    <div className="input-form file">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                      <label>Vehicle Image</label>
                    </div>
                  </div>
                </div>

                <div className="add-owner-info">
                  <h2>Owner Info</h2>
                  <div className="input-container">
                    <div className="input-form">
                      <input
                        name="owner_name"
                        className="input-box"
                        placeholder=" "
                        value={form.owner_name}
                        onChange={handleChange}
                      />
                      <label>Owner Name</label>
                    </div>
                    <div className="input-form">
                      <input
                        name="owner_phone"
                        className="input-box"
                        placeholder=" "
                        value={form.owner_phone}
                        onChange={handleChange}
                      />
                      <label>Owner Phone</label>
                    </div>
                  </div>
                </div>

                <div className="select-slots">
                  <h2>Parking Slots</h2>
                  <div className="select-form">
                    <div className="select-form-group">
                      <div
                        className={`dropdown-title ${openSlot ? "active" : ""}`}
                        onClick={() => setOpenSlot(!openSlot)}
                      >
                        {form.slot_id
                          ? slots.find((s) => s.id === Number(form.slot_id))
                              ?.slot_number
                          : "Select Parking Slot"}
                      </div>
                      <label>Parking Slot</label>
                      {openSlot && (
                        <div className="dropdown">
                          {slots.map((slot) => (
                            <div
                              key={slot.id}
                              className="dropdown-item"
                              onClick={() => {
                                setForm({ ...form, slot_id: slot.id });
                                setOpenSlot(false);
                              }}
                            >
                              {slot.slot_number}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="add-vehicle-btn">
                Add Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddVehicle;
