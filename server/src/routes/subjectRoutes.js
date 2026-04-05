import express from "express";
import {
  createSubject,
  getSubjects,
  getMySubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create subject
router.post("/", protect, authorizeRoles("admin"), createSubject);

// Student subjects
router.get("/my-subjects", protect, authorizeRoles("student"), getMySubjects);

// Get all subjects (with optional grade filter)
router.get("/", getSubjects);

// Get single subject
router.get("/:id", getSubjectById);

// Update subject
router.put("/:id", protect, authorizeRoles("admin"), updateSubject);

// Delete subject
router.delete("/:id", protect, authorizeRoles("admin"), deleteSubject);

export default router;