import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  markAttendance,
  getStudentAttendance,
  getAllAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/", protect, adminOnly, markAttendance);
router.get("/", protect, adminOnly, getAllAttendance);
router.get("/my-attendance", protect, getStudentAttendance);

export default router;