import { Router } from "express";
import { analyzeImage } from "../controllers/AI_Controller.js";
import { uploadImage } from "../middleware/UploadMiddleWare.js";

const router = Router();

router.post("/analyze-image", uploadImage.single("image"), analyzeImage);

export default router;