import express from "express";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import { importStudents, exportStudents } from "../controllers/excelController.js";

const router = express.Router();

router.post("/import", protect(["admin"]), upload.single("file"), importStudents);
router.get("/export", protect(["admin"]), exportStudents);

export default router;
