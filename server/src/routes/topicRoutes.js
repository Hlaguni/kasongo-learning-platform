import express from "express";
import Topic from "../models/Topic.js";

const router = express.Router();

// GET all topics
router.get("/", async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: "Error fetching topics" });
  }
});

export default router;