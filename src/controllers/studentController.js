import Student from "../models/Student.js";

// ✅ Add Student (Admin only)
export const addStudent = async (req, res) => {
  try {
    const { name, class: className, gender, dob, photo } = req.body;
    const student = new Student({ name, class: className, gender, dob, photo });
    await student.save();
    res.status(201).json({ message: "Student added successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get All Students (pagination + filter)
export const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", className = "" } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (className) query.class = className;

    const students = await Student.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({ students, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update Student
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
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
