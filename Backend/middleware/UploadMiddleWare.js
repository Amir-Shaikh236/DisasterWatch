import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only Image files are allowed"), false)
};

export const uploadImage = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});

