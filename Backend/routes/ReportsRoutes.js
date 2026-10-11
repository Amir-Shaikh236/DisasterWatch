import express from "express";
import { getReports, addReport, deleteReport } from "../controllers/ReportController.js";
import { uploadImages } from "../middleware/UploadMiddleWare.js";
import { protect } from "../middleware/authMiddleware.js";
import { geminiRateLimit } from "../middleware/geminiRateLimit.js";

const router = express.Router();

router.get('/get', protect, getReports);
router.post('/add', protect, uploadImages.array("images", 5), geminiRateLimit("report"), addReport);
router.delete('/delete/:id', protect, deleteReport);

export default router;