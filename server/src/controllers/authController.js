import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Admin only (later protected in routes)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all required fields",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Restrict allowed roles
    const allowedRoles = ["admin", "educator", "student"];

    let userRole = "student"; // default

    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Invalid role specified",
        });
      }

      userRole = role;
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: userRole,
    });

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register user error:", error);
    return res.status(500).json({
      message: "Server error while registering user",
    });
  }
};
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login user error:", error);
    return res.status(500).json({ message: "Server error while logging in" });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Server error while fetching user" });
  }
};