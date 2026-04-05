import express from "express";
import {
  createMCQ,
  getMCQs,
  getMCQByLesson,
  getStudentMCQByLesson,
  submitStudentMCQ,
  updateMCQ,
  deleteMCQ,
} from "../controllers/mcqController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes
router.post("/", protect, authorizeRoles("admin"), createMCQ);
router.get("/", protect, authorizeRoles("admin"), getMCQs);
router.get("/lesson/:lessonId", protect, authorizeRoles("admin"), getMCQByLesson);
router.put("/:id", protect, authorizeRoles("admin"), updateMCQ);
router.delete("/:id", protect, authorizeRoles("admin"), deleteMCQ);

// Student routes
router.get(
  "/student/lesson/:lessonId",
  protect,
  authorizeRoles("student"),
  getStudentMCQByLesson
);

router.post(
  "/student/submit/:lessonId",
  protect,
  authorizeRoles("student"),
  submitStudentMCQ
);

export default router;