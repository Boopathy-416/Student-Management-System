import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// ✅ Teacher Register
export const registerTeacher = async (req, res) => {
  try {
    const { name, dob, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new User({
      name,
      dob,
      email,
      password: hashedPassword,
      role: "teacher"
    });

    await newTeacher.save();

    res.status(201).json({ message: "Account registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Teacher Login
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    const teacher = await User.findOne({ email, role: "teacher" });
    if (!teacher) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: teacher._id, role: teacher.role }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, role: teacher.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Admin Login (hardcoded)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "Admin@gmail.com" && password === "@Admin123") {
      const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
      return res.json({ message: "Admin login successful", token, role: "admin" });
    }

    return res.status(400).json({ message: "Invalid admin credentials" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
