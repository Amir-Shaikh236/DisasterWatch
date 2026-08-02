import User from "../models/User.js"
import { SignToken, setRefreshCookie } from "../services/authService.js";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const userExist = await User.findOne({ email });
    if (userExist)
      return next(new AppError(403, "User with this email already exist"));

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      refreshTokens: [],
    });

    const { accessToken, refreshToken } = SignToken(user._id, user.role);
    await User.updateOne({ _id: user._id }, { $push: { refreshTokens: refreshToken } }, { runValidators: false });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({
      status: "success",
      user: { id: user._id, email: user.email },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new AppError(400, "Please enter email and password"));

    const user = await User.findOne({ email }).select("+password +refreshTokens");

    if (!user || !(await user.matchPassword(password)))
      return next(new AppError(401, "Incorrect email or password"));

    const { accessToken, refreshToken } = SignToken(user._id, user.role);

    let activeToken = user.refreshTokens;

    if (req.cookies?.refreshToken)
      activeToken = activeToken.filter(
        (token) => token !== req.cookies.refreshToken,
      );

    activeToken.push(refreshToken);

    user.refreshTokens = activeToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    res.status(200).json({
      status: "success",
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      accessToken,
    });

  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return next(new AppError(401, "Authentication token missing"));

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      await User.updateOne(
        { refreshTokens: refreshToken },
        { $pull: { refreshTokens: refreshToken } },
      );
      return next(new AppError(403, "Session Expired or invalid token"));
    }

    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user)
      return next(
        new AppError(
          403,
          "User Profile associated with the token is not exist",
        ),
      );

    if (!user.refreshTokens.includes(refreshToken)) {
      user.refreshTokens = [];
      await user.save({ validateBeforeSave: false });
      return next(
        new AppError(
          403,
          "Compromised token usage detected. Wiping all sessions",
        ),
      );
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    const tokens = SignToken(user._id, user.role);
    user.refreshTokens.push(tokens.refreshToken);
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, tokens.refreshToken);

    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken)
      await User.updateOne(
        { refreshTokens: refreshToken },
        { $pull: { refreshTokens: refreshToken } },
      );

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: true,
      path: "/api/auth/refresh",
    });

    res.status(200).json({ status: "success", message: "logout successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOneAndDelete({ email });
    if (!user) return next(new AppError(404, "User Not Found"));
    res.status(200).json({ status: "success", message: "User Deleted" });
  } catch (error) {
    next(error);
  }
};

export { register, login, refreshToken, logout, deleteUser }
