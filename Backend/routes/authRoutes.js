import express from "express"
import { register, login, logout, deleteUser, refreshToken, UpdateUser, getCurrentUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//POST Routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken)
router.post("/logout", logout);
router.post("/user/delete", deleteUser);
router.post('/user/update', protect, UpdateUser);

//GET Routes
router.get("/me", protect, getCurrentUser)

export default router;
