import Student from "../models/Student.js";
import { bufferToRows, validateHeaders, parseRow, makeWorkbookFromStudents } from "../utils/excel.js";


export const importStudents = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({ message: "Excel file is required" });
    }

    const rows = bufferToRows(req.file.buffer);
    if (!rows.length) return res.status(400).json({ message: "Excel is empty" });

    // Header check
    const headerCheck = validateHeaders(rows[0]);
    if (!headerCheck.ok) {
      return res.status(400).json({ message: `Missing required columns: ${headerCheck.missing.join(", ")}` });
    }

    // Validate rows
    const valid = [];
    const invalid = [];
    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // header is row 1
      const { payload, errors } = parseRow(rows[i]);
      if (errors.length) {
        invalid.push({ row: rowNum, errors });
      } else {
        valid.push(payload);
      }
    }

    // Duplicate detection rules:
    // 1) Prefer rollNumber uniqueness if provided
    // 2) Fallback composite: name + class + dob(yyyy-mm-dd)
    // Build a map to de-dupe within file itself
    const seen = new Set();
    const finalDocs = [];
    for (const p of valid) {
      const key = p.rollNumber
        ? `roll:${p.rollNumber.toLowerCase()}`
        : `comp:${p.name.toLowerCase()}|${p.class.toLowerCase()}|${p.dob ? p.dob.toISOString().slice(0,10) : ""}`;
      if (seen.has(key)) {
        invalid.push({ row: "n/a", errors: ["duplicate row inside file"] });
        continue;
      }
      seen.add(key);
      finalDocs.push(p);
    }

    // Upsert logic:
    // - If rollNumber present: use { rollNumber } as match
    // - Else use composite (name+class+dob) as match
    let inserted = 0, updated = 0;
    const results = [];
    for (const doc of finalDocs) {
      const filter = doc.rollNumber
        ? { rollNumber: doc.rollNumber }
        : { name: doc.name, class: doc.class, dob: doc.dob || undefined };

      // null/undefined comparison on dob: if missing dob, don't include dob in filter
      if (!filter.dob) delete filter.dob;

      const updatedDoc = await Student.findOneAndUpdate(
        filter,
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (updatedDoc) {
        // determine if it was insert or update by seeing if it existed previously
        const existedBefore = await Student.findOne(filter).lean();
        // NOTE: since we just upserted, above check would always find.
        // Instead, better get write result, but Mongoose doesn't return it directly.
        // Simple heuristic: check createdAt === updatedAt after save (insert) vs not equal (update).
        if (updatedDoc.createdAt?.toISOString() === updatedDoc.updatedAt?.toISOString()) {
          inserted++;
        } else {
          updated++;
        }
        results.push(updatedDoc._id);
      }
    }

return res.json({
  message: "Import processed",
  summary: {
    totalRows: rows.length,
    valid: finalDocs.length,
    invalid: invalid.length,
    inserted,
    updated
  },
  invalidRows: invalid,
  students: await Student.find().sort({ createdAt: -1 }).lean() // return all students
});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

/**
 * GET /api/excel/export
 * Admin only. Returns an .xlsx of all students
 */
export const exportStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    const buffer = makeWorkbookFromStudents(students);

    res.setHeader("Content-Disposition", "attachment; filename=students_export.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
