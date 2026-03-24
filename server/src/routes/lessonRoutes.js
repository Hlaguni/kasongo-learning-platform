import express from "express";
import { createLesson, getLessons } from "../controllers/lessonController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// anyone logged in → can view lessons
router.get("/", protect, getLessons);

// only admin → can create lessons
router.post("/", protect, adminOnly, createLesson);

export default router;