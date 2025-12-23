const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// ✅ Minimal + safe: wrap async handlers to avoid unhandled promise rejections
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post("/register", asyncHandler(registerUser));
router.post("/login", asyncHandler(loginUser));
router.post("/logout", asyncHandler(logoutUser));

router.get(
  "/check-auth",
  asyncHandler(authMiddleware),
  (req, res) => {
    const user = req.user;
    return res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user,
    });
  }
);

module.exports = router;
