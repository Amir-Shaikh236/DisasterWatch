import { Router } from "express";
import { analyzeImage } from "../controllers/AI_Controller.js";
import { uploadAnalyzeImage } from "../middleware/UploadMiddleWare.js";

const router = Router();

router.post("/analyze-image", uploadAnalyzeImage.single("image"), analyzeImage);

export default router;