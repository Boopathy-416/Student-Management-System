import express from "express";
import { registerTeacher, loginTeacher, loginAdmin } from "../controllers/authController.js";

const router = express.Router();

// Teacher Auth
router.post("/teacher/register", registerTeacher);
router.post("/teacher/login", loginTeacher);

// Admin Auth
router.post("/admin/login", loginAdmin);

export default router;
