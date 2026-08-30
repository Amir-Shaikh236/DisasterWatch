import jwt from 'jsonwebtoken'
import AppError from "../utils/AppError.js";
import User from "../models/User.js";

export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new AppError(401, 'Authentication Required'));

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

        const user = await User.findById(decoded.id).select(
            "_id role"
        );

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;
        next();

    } catch (error) {
        console.error("Socket Authentication Failed:", error);
        next(error)

    }
}