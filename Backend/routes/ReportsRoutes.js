import express from "express";
import { getReports, addReport } from "../controllers/ReportController.js";
import { uploadAnalyzeImage } from "../middleware/UploadMiddleWare.js";

const router = express.Router();

router.get('/get', getReports);
router.post('/add', uploadAnalyzeImage.array("images", 5), addReport);

export default router;