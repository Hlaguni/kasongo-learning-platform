import express from "express";
import {
  createLesson,
  getLessons,
  getLessonsForStudent,
  getLessonsByTopic,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes
router.get("/my-lessons", protect, authorizeRoles("student"), getLessonsForStudent);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getLessons);
router.post("/", protect, authorizeRoles("admin"), createLesson);
router.get("/topic/:topicId", protect, authorizeRoles("admin"), getLessonsByTopic);
router.put("/:id", protect, authorizeRoles("admin"), updateLesson);
router.delete("/:id", protect, authorizeRoles("admin"), deleteLesson);

// Private route for single lesson
router.get("/:id", protect, getLessonById);

export default router;