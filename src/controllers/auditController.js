// src/controllers/auditController.js
import AuditLog from "../models/AuditLog.js";

// Save log (called from studentController after CRUD)
export const addLog = async (user, action, target, changes = {}) => {
  try {
    await AuditLog.create({ user, action, target, changes });
  } catch (err) {
    console.error("Failed to save audit log:", err.message);
  }
};

// Fetch logs (for admin/teacher dashboard)
export const getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
