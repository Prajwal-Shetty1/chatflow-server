import multer from "multer";

// store files temporarily in /uploads folder
const upload = multer({
  dest: "uploads/",
});

export default upload;