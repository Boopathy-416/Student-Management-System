import multer from "multer";
const storage = multer.memoryStorage(); // keep file in memory
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/i)) {
      return cb(new Error("Only .xlsx or .xls files are allowed"));
    }
    cb(null, true);
  }
});
export default upload;
