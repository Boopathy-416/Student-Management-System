import express from "express";
import { addStudent, getStudents, updateStudent, deleteStudent } from "../controllers/studentController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Admin Only CRUD
router.post("/", protect(["admin"]), addStudent);
router.get("/", protect(["admin", "teacher"]), getStudents); // both can view
router.put("/:id", protect(["admin"]), updateStudent);
router.delete("/:id", protect(["admin"]), deleteStudent);

export default router;
