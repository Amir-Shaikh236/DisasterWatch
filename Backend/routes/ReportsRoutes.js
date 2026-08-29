import express from "express";
import { getReports, addReport, deleteReport } from "../controllers/ReportController.js";
import { uploadImages } from "../middleware/UploadMiddleWare.js";

const router = express.Router();

router.get('/get', getReports);
router.post('/add', uploadImages.array("images", 5), addReport);
router.delete('/delete/:id', deleteReport);

export default router;