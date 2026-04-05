import express from "express";
import {
  getStudents,
  getStudentById,
  getStudentEnrollments,
} from "../controllers/studentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin: get all students
router.get("/", protect, authorizeRoles("admin"), getStudents);

// Admin: get single student's enrollments
router.get(
  "/:id/enrollments",
  protect,
  authorizeRoles("admin"),
  getStudentEnrollments
);

// Admin: get single student by ID
router.get("/:id", protect, authorizeRoles("admin"), getStudentById);

export default router;