import express from "express";
import { getReports, addReport } from "../controllers/ReportController.js";
import { uploadImages } from "../middleware/UploadMiddleWare.js";

const router = express.Router();

router.get('/get', getReports);
router.post('/add', uploadImages.array("images", 5), addReport);

export default router;