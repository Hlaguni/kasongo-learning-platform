import Lesson from "../models/Lesson.js";
import Topic from "../models/Topic.js";

// CREATE LESSON (admin only)
export const createLesson = async (req, res) => {
  try {
    const { title, topicId, videoUrl, description } = req.body;

    if (!title || !topicId || !videoUrl) {
      return res.status(400).json({
        message: "Title, topicId, and video URL are required",
      });
    }

    const topicExists = await Topic.findById(topicId);

    if (!topicExists) {
      return res.status(404).json({
        message: "Topic not found",
      });
    }

    const lesson = await Lesson.create({
      title,
      topicId,
      videoUrl,
      description,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create lesson",
      error: error.message,
    });
  }
};

// GET ALL LESSONS (students + admin)
export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate("createdBy", "name email")
      .populate("topicId", "name grade")
      .sort({ createdAt: -1 });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lessons",
      error: error.message,
    });
  }
};