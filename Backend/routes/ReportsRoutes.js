import express from "express";
import { getReports, addReport, deleteReport } from "../controllers/ReportController.js";
import { uploadImages } from "../middleware/UploadMiddleWare.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get('/get', protect, getReports);
router.post('/add', protect, uploadImages.array("images", 5), addReport);
router.delete('/delete/:id', protect, deleteReport);

export default router;