const express = require("express");
const router = express.Router();

const {
  createTenant,
  getTenants,
  getTenantById,
  assignAdminToTenant,
} = require("../controllers/tenantController");

// Create a new tenant
router.post("/", createTenant);

// Get all tenants
router.get("/", getTenants);

// Get one tenant by ID
router.get("/:id", getTenantById);

// Assign an admin to a tenant
router.post("/assign-admin", assignAdminToTenant);

module.exports = router;
