import express from "express";
import {
  getAllResults,
  getStudentResults,
  getLessonResults,
  getSubjectResults,
  getMCQResults,
  getMyResults,
  getResultSummary,
} from "../controllers/resultController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-results", protect, authorizeRoles("student"), getMyResults);

router.get("/summary", protect, authorizeRoles("admin"), getResultSummary);

router.get("/", protect, authorizeRoles("admin"), getAllResults);

router.get("/student/:studentId", protect, authorizeRoles("admin"), getStudentResults);
router.get("/lesson/:lessonId", protect, authorizeRoles("admin"), getLessonResults);
router.get("/subject/:subjectId", protect, authorizeRoles("admin"), getSubjectResults);
router.get("/mcq/:mcqId", protect, authorizeRoles("admin"), getMCQResults);

export default router;