
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  // Unique student key (from Excel). You can name it Admission No / Roll No.
  rollNumber: { type: String, trim: true, index: true, unique: true, sparse: true },

  name: { type: String, required: true, trim: true },
  class: { type: String, required: true, trim: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  dob: { type: Date },                   // ISO: "2006-03-15"
  photo: { type: String, trim: true },   // URL
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
