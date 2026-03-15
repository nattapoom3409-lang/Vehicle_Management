import React from "react";
import { useNavigate } from "react-router-dom";
import "./VehicleTable.css";

function VehicleTable({ vehicles, loading, canEditVehicle }) {
  const navigate = useNavigate();

  return (
    <div className="table-wrapper">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Vehicle Info</th>
              <th>Vehicle Type</th>
              <th>Status</th>
              <th>Current Slot</th>
              {canEditVehicle && <th>View Detail</th>}
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td className="plate-cell">
                  <strong>{v.plate_number}</strong>
                </td>

                <td>
                  <div className="vehicle-info">
                    <span>
                      {v.brand} {v.model}
                    </span>
                    <small>{v.color}</small>
                  </div>
                </td>

                <td>{v.vehicle_type}</td>

                <td>
                  <span className={`status-badge ${v.current_status}`}>
                    {v.current_status}
                  </span>
                </td>

                <td className="slot-cell">{v.current_slot || "-"}</td>

                {canEditVehicle && (
                  <td className="view-detail-link">
                    <span
                      className="view-btn"
                      onClick={() => navigate(`/vehicles/${v.id}`)}
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
                        class="lucide lucide-square-arrow-out-up-right-icon lucide-square-arrow-out-up-right"
                      >
                        <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                        <path d="m21 3-9 9" />
                        <path d="M15 3h6v6" />
                      </svg>
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VehicleTable;
