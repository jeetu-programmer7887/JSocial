import multer from "multer";

// We use memoryStorage so the file is kept in RAM as a Buffer.
// This is required to quickly convert it to base64 for Cloudinary.
const storage = multer.memoryStorage();

// Optional but recommended: Only accept image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// Set up the multer upload middleware
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Set a 5MB limit to prevent server overload
    }
});

export default upload;