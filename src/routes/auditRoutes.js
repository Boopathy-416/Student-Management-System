// src/routes/auditRoutes.js
import express from "express";
import { protect } from "../middleware/auth.js";
import { getLogs } from "../controllers/auditController.js";

const router = express.Router();

// only admin/teacher should see logs
router.get("/", protect(["admin", "teacher"]), getLogs);

export default router;
