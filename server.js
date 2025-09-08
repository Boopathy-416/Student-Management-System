import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import connectDB from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import excelRoutes from "./src/routes/excelRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";


dotenv.config();
const app = express();

// ✅ Configure CORS properly
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Vite dev server
  "https://student-management-system-76kr.onrender.com", // your backend itself
  "https://your-frontend-domain.com" // replace with deployed frontend later
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/audit-logs", auditRoutes);

// Connect DB
connectDB();

// Health Check
app.get("/", (req, res) => {
  res.send(" Backend API 🚀 Running Successfully ✅");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
