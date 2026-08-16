import { AI_AnalyzeImageForDisaster } from "../services/gemini/AnalyzeImage.js";
import AppError from "../utils/AppError.js"

export const analyzeImage = async (req, res, next) => {
    if (!req.file) return next(new AppError(400, "Image in base64 is Required"));

    try {
        const base64Image = req.file.buffer.toString("base64");

        const analysis = await AI_AnalyzeImageForDisaster(base64Image, req.file.mimetype);

        return res.status(200).json({ status: 'success', analysis });

    } catch (error) {
        next(error);

    }
}