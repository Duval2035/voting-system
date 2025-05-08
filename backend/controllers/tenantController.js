// backend/controllers/tenantController.js
const Tenant = require("../models/Tenant");
const User = require("../models/User");


// Create a new tenant
const createTenant = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingTenant = await Tenant.findOne({ name });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant already exists" });
    }

    const tenant = new Tenant({ name, description });
    await tenant.save();

    res.status(201).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all tenants
const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    res.status(200).json(tenants);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a single tenant by ID
const getTenantById = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    res.status(200).json(tenant);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Assign an admin user to a tenant
const assignAdminToTenant = async (req, res) => {
  try {
    const { tenantId, adminId } = req.body;

    const user = await User.findById(adminId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = "admin";
    user.tenant = tenantId;
    await user.save();

    res.status(200).json({ message: "Admin assigned to tenant successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTenant,
  getTenants,
  getTenantById,
  assignAdminToTenant,
};

