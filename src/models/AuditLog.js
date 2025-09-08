// src/models/AuditLog.js
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    user: { type: String, required: true }, // username / email / role
    action: { type: String, required: true }, // "add", "update", "delete"
    target: { type: String }, // studentId or student name
    changes: { type: Object }, // optional - what changed
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
