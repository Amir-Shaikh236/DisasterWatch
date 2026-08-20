import multer from 'multer';

const AnalyzeStore = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only Image files are allowed"), false)
};

export const uploadAnalyzeImage = multer({
    AnalyzeStore,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter
});

export const uploadImages = multer({
    AnalyzeStore,
    limits: { files: 5, fileSize: 10 * 1024 * 1024 },
    fileFilter
});

