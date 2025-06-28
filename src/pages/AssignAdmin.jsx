import React, { useState } from "react";
import API_BASE_URL from "../config";

function AssignAdmin() {
  const [tenantId, setTenantId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [message, setMessage] = useState("");

  const handleAssign = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tenants/assign-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tenantId, adminId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Admin assigned successfully.");
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage("Network error");
    }
  };

  return (
    <div>
      <h2>Assign Admin to Tenant</h2>
      <input
        type="text"
        placeholder="Tenant ID"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Admin User ID"
        value={adminId}
        onChange={(e) => setAdminId(e.target.value)}
      />
      <button onClick={handleAssign}>Assign Admin</button>
      <p>{message}</p>
    </div>
  );
}

export default AssignAdmin;
