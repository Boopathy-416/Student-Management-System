import * as XLSX from "xlsx";

// Expected columns in Excel (case-insensitive match by header text)
export const REQUIRED_HEADERS = [
  "name", "class", "gender"   // required
];
export const OPTIONAL_HEADERS = [
  "dob", "photo", "rollnumber" // optional but rollNumber helps dedupe
];

export function bufferToRows(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }); // array of objects
  return rows;
}

export function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ""); // "Roll Number" -> "rollnumber"
}

export function validateHeaders(firstRow) {
  const keys = Object.keys(firstRow || {}).map(normalizeHeader);
  const has = (k) => keys.includes(normalizeHeader(k));
  const missing = REQUIRED_HEADERS.filter(h => !has(h));
  return { ok: missing.length === 0, missing };
}

export function parseRow(raw) {
  // normalize keys
  const obj = {};
  for (const [k, v] of Object.entries(raw)) {
    obj[normalizeHeader(k)] = v;
  }

  // build student payload
  const payload = {
    name: String(obj.name || "").trim(),
    class: String(obj.class || "").trim(),
    gender: String(obj.gender || "").trim().toLowerCase(),
    dob: obj.dob ? new Date(obj.dob) : undefined,
    photo: obj.photo ? String(obj.photo).trim() : undefined,
    rollNumber: obj.rollnumber ? String(obj.rollnumber).trim() : undefined,
  };

  // validations (same rules as schema)
  const errors = [];
  if (!payload.name) errors.push("name required");
  if (!payload.class) errors.push("class required");
  if (!["male","female"].includes(payload.gender)) errors.push("gender must be 'male' or 'female'");
  if (payload.dob && isNaN(payload.dob.getTime())) errors.push("dob invalid date");

  return { payload, errors };
}

export function makeWorkbookFromStudents(students) {
  const data = students.map(s => ({
    RollNumber: s.rollNumber || "",
    Name: s.name,
    Class: s.class,
    Gender: s.gender,
    DOB: s.dob ? new Date(s.dob).toISOString().slice(0,10) : "",
    Photo: s.photo || "",
    CreatedAt: s.createdAt ? new Date(s.createdAt).toISOString() : "",
    UpdatedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : ""
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
