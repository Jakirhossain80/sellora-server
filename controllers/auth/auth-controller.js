const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

const isProduction = process.env.NODE_ENV === "production";

// ✅ Minimal + safe: keep the fallback for dev so nothing breaks,
// but if production is missing JWT_SECRET, warn loudly.
const JWT_SECRET = process.env.JWT_SECRET || "CLIENT_SECRET_KEY";

if (isProduction && !process.env.JWT_SECRET) {
  console.warn(
    "⚠️ WARNING: JWT_SECRET is missing in production .env (using fallback). Please set JWT_SECRET."
  );
}

const cookieOptions = {
  httpOnly: true,
  secure: isProduction, // true only in production (HTTPS)
  sameSite: isProduction ? "none" : "lax",
  maxAge: 60 * 60 * 1000, // 60m
  path: "/", // ✅ keeps set/clear consistent
};

// small helper (minimal + safe)
const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

//register
const registerUser = async (req, res) => {
  const userName =
    typeof req.body?.userName === "string" ? req.body.userName.trim() : "";
  const email = normalizeEmail(req.body?.email);
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  // ✅ Minimal validation to prevent crashes / bad data
  if (!userName || !email || !password) {
    return res.json({
      success: false,
      message: "Please provide userName, email and password",
    });
  }

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();

    return res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    // ✅ Handle possible duplicate key error safely (if unique index exists)
    if (e?.code === 11000) {
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });
    }

    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  // ✅ Minimal validation to prevent crashes / odd queries
  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please provide email and password",
    });
  }

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      JWT_SECRET,
      { expiresIn: "60m" }
    );

    return res.cookie("token", token, cookieOptions).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout
const logoutUser = (req, res) => {
  // ✅ Minimal improvement: reuse the same cookieOptions to ensure perfect match
  res.clearCookie("token", cookieOptions);

  return res.json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware };
