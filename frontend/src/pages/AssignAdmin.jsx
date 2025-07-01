import React, { useState } from "react";
import API_BASE_URL from "../config";

function AssignAdmin() {
  const [tenantId, setTenantId] = useState("");
  const [adminId, setAdminId] = useState("");
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

  const handleAssign = async () => {
    setMessage("");
    if (!tenantId || !adminId) {
      setMessage("Please provide both Tenant ID and Admin User ID.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/tenants/assign-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ tenantId, adminId }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Admin assigned successfully.");
        setTenantId("");
        setAdminId("");
      } else {
        setMessage(`❌ Error: ${data.message || "Failed to assign admin"}`);
      }
    } catch (error) {
      setMessage("❌ Network error. Please try again later.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Assign Admin to Tenant</h2>
      <input
        type="text"
        placeholder="Tenant ID"
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Admin User ID"
        value={adminId}
        onChange={(e) => setAdminId(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <button onClick={handleAssign} style={{ width: "100%", padding: 10 }}>
        Assign Admin
      </button>
      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}

export default AssignAdmin;
