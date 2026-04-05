import express from "express";
import {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
} from "../controllers/gradeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/", protect, authorizeRoles("admin"), createGrade);
router.put("/:id", protect, authorizeRoles("admin"), updateGrade);
router.delete("/:id", protect, authorizeRoles("admin"), deleteGrade);

// Public or protected
router.get("/", getGrades);

export default router;