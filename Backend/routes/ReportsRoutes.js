import express from "express";
import { getReports, addReport } from "../controllers/ReportController.js";

const router = express.Router();

router.get('/get', getReports);
router.post('/add', addReport);

export default router;