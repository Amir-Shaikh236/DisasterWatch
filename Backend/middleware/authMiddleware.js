import jwt from "jsonwebtoken"
import AppError from "../utils/AppError.js"

export const protected = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader?.startsWith("Bearer")) return next(new AppError(401, "Access Denied, Authorization token missing or invalid format"));

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return next(new AppError(403, "invalid or expired access token context"));

    req.user = { id: decoded.id, role: decoded.role };
    next();

  });
};
