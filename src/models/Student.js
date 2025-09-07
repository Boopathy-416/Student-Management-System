import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  dob: { type: Date },
  photo: { type: String }
}, { timestamps: true });

export default mongoose.model("Student", studentSchema);
