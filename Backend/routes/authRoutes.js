import express from "express"
import { register, login, logout, deleteUser, refreshToken, UpdateUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refreshToken)
router.post("/user/delete", deleteUser);
router.post('/user/update', protect, UpdateUser);

export default router;
