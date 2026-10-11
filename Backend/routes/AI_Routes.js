import { Router } from "express";
import { analyzeImage } from "../controllers/AI_Controller.js";
import { uploadAnalyzeImage } from "../middleware/UploadMiddleWare.js";
import { protect } from "../middleware/authMiddleware.js";
import { geminiRateLimit } from "../middleware/geminiRateLimit.js";

const router = Router();

router.post("/analyze-image", protect, uploadAnalyzeImage.single("image"), geminiRateLimit("image"), analyzeImage);

export default router;