import express from "express";
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  getEnrollmentsByStudent,
  getMyEnrollments,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/my-enrollments", protect, getMyEnrollments);

router.get("/", protect, authorizeRoles("admin"), getEnrollments);
router.get("/:id", protect, authorizeRoles("admin"), getEnrollmentById);
router.get("/student/:studentId", protect, authorizeRoles("admin"), getEnrollmentsByStudent);
router.post("/", protect, authorizeRoles("admin"), createEnrollment);
router.put("/:id", protect, authorizeRoles("admin"), updateEnrollment);
router.delete("/:id", protect, authorizeRoles("admin"), deleteEnrollment);

export default router;