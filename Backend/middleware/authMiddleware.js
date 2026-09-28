import jwt from "jsonwebtoken"
import AppError from "../utils/AppError.js"
import User from "../models/User.js";
import rateLimit from "express-rate-limit"

export const protect = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer")) return next(new AppError(401, "Access Denied, Authorization token missing or invalid format"));

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError(404, "User not Found"));

    req.user = user;

    next();

  } catch (error) {
    return next(new AppError(401, "Invalid or expired access token"));

  }
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'fail',
    message: 'Too many login attempts, Please try again after 15mins'
  },

  standardHeaders: true,
  legacyHeaders: false

});
