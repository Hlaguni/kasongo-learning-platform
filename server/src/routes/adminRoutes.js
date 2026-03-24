import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js"; 
import {
  getAdminDashboard,
  createUserByAdmin,
  getAllUsers,
  deleteUserByAdmin
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.post("/users", protect, adminOnly, createUserByAdmin);
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:id", protect, adminOnly, deleteUserByAdmin);

export default router;