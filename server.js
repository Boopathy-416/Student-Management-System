import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import connectDB from "./src/config/db.js";
import studentRoutes from "./src/routes/studentRoutes.js";



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);



// Connect DB
connectDB();
// Health Check
app.get('/', (req, res) => {
  res.send(' Backend API 🚀 Running Successfully ✅');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
