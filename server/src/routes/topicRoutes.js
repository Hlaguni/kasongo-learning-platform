import express from "express";
import {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
  getTopicsForStudent,
} from "../controllers/topicController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Student route
router.get("/my-topics", protect, authorizeRoles("student"), getTopicsForStudent);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getTopics);
router.get("/:id", protect, getTopicById);
router.post("/", protect, authorizeRoles("admin"), createTopic);
router.put("/:id", protect, authorizeRoles("admin"), updateTopic);
router.delete("/:id", protect, authorizeRoles("admin"), deleteTopic);

export default router;