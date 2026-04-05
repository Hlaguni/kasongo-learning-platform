import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public login
router.post("/login", loginUser);

// Private current user
router.get("/me", protect, getCurrentUser);

// Admin creates users
router.post("/register", protect, authorizeRoles("admin"), registerUser);

export default router;