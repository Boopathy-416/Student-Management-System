import Student from "../models/Student.js";
import { logAction } from "../middleware/auditLogger.js";

// ✅ Add Student (Admin only)
export const addStudent = async (req, res) => {
  try {
    const { name, class: className, gender, dob, photo } = req.body;
    const student = new Student({ name, class: className, gender, dob, photo });
    await student.save();

    // log it
    await addLog(req.user?.role || "unknown", "add", student._id, student);

    res.status(201).json({ message: "Student added successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Students (pagination + filter)
export const getStudents = async (req, res) => {
  try {
    let { page = 1, limit = 10, name, class: className } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    if (name) filter.name = new RegExp(name, "i"); // case-insensitive
    if (className) filter.class = className;

    const total = await Student.countDocuments(filter);
    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      students,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ✅ Update Student
// export const updateStudent = async (req, res) => {
//   try {
//     const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     res.json({ message: "Student updated successfully", student });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Example in updateStudent
export const updateStudent = async (req, res) => {
  try {
    const before = await Student.findById(req.params.id).lean();
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });

    await logAction(req.user.name, "update", "Student", before, student);

    res.json({ message: "Student updated successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ✅ Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/stats
export const getStudentStats = async (req, res) => {
  try {
    const total = await Student.countDocuments();

    // Group by class
    const perClass = await Student.aggregate([
      { $group: { _id: "$class", count: { $sum: 1 } } }
    ]);

    // Gender ratio
    const genderRatio = await Student.aggregate([
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    res.json({ total, perClass, genderRatio });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



