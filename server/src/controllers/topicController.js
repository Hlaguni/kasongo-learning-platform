import mongoose from "mongoose";
import Topic from "../models/Topic.js";
import Subject from "../models/Subject.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import MCQ from "../models/MCQ.js";

// @desc    Create topic
// @route   POST /api/topics
// @access  Admin
export const createTopic = async (req, res) => {
  try {
    const { name, grade, subject, term, description, order, isActive } = req.body || {};

    if (!name || !grade || !subject || !term) {
      return res.status(400).json({
        message: "Name, grade, subject, and term are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(grade)) {
      return res.status(400).json({ message: "Invalid grade ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    const subjectExists = await Subject.findById(subject).populate("grade", "name value");
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (!subjectExists.isActive) {
      return res.status(400).json({ message: "Subject is inactive" });
    }

    // Ensure the selected subject actually belongs to the selected grade
    if (!subjectExists.grade || subjectExists.grade._id.toString() !== grade.toString()) {
      return res.status(400).json({
        message: "Selected subject does not belong to the selected grade",
      });
    }

    const existingTopic = await Topic.findOne({
      name: name.trim(),
      grade,
      subject,
      term,
    });

    if (existingTopic) {
      return res.status(400).json({
        message: "Topic already exists for this grade, subject, and term",
      });
    }

    const topic = await Topic.create({
      name: name.trim(),
      grade,
      subject,
      term,
      description: description?.trim() || "",
      order: order ?? 1,
      isActive: isActive ?? true,
    });

    const populatedTopic = await Topic.findById(topic._id)
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade",
        populate: {
          path: "grade",
          select: "name value",
        },
      });

    return res.status(201).json(populatedTopic);
  } catch (error) {
    console.error("Create topic error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Topic already exists for this grade, subject, and term",
      });
    }

    return res.status(500).json({ message: "Error creating topic" });
  }
};

// @desc    Get all topics
// @route   GET /api/topics
// @access  Admin
export const getTopics = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      })
      .sort({ term: 1, order: 1, name: 1 });

    return res.json(topics);
  } catch (error) {
    console.error("Get topics error:", error);
    return res.status(500).json({ message: "Error fetching topics" });
  }
};

// @desc    Get student topics based on active enrollments
// @route   GET /api/topics/my-topics
// @access  Private/Student
export const getTopicsForStudent = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({
      student: studentId,
      accessStatus: "active",
      isActive: true,
    }).select("grade subject");

    if (!enrollments.length) {
      return res.json([]);
    }

    const allowedPairs = enrollments.map((e) => ({
      grade: e.grade,
      subject: e.subject,
    }));

    const topics = await Topic.find({
      isActive: true,
      $or: allowedPairs,
    })
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      })
      .sort({ term: 1, order: 1, name: 1 });

    const topicsWithCounts = await Promise.all(
      topics.map(async (topic) => {
        const lessons = await Lesson.find({
          topic: topic._id,
          isActive: true,
        }).select("_id");

        const lessonsCount = lessons.length;
        const lessonIds = lessons.map((lesson) => lesson._id);

        const quizzesCount = await MCQ.countDocuments({
          lesson: { $in: lessonIds },
          isActive: true,
        });

        return {
          ...topic.toObject(),
          lessonsCount,
          quizzesCount,
        };
      })
    );

    return res.json(topicsWithCounts);
  } catch (error) {
    console.error("Get topics for student error:", error);
    return res.status(500).json({ message: "Error fetching student topics" });
  }
};

// @desc    Get single topic by ID
// @route   GET /api/topics/:id
// @access  Private
export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }

    const topic = await Topic.findById(id)
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      });

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (req.user.role === "student") {
      const allowedEnrollment = await Enrollment.findOne({
        student: req.user._id,
        grade: topic.grade._id || topic.grade,
        subject: topic.subject._id,
        accessStatus: "active",
        isActive: true,
      });

      if (!allowedEnrollment) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    return res.json(topic);
  } catch (error) {
    console.error("Get topic by ID error:", error);
    return res.status(500).json({ message: "Error fetching topic" });
  }
};

// @desc    Update topic
// @route   PUT /api/topics/:id
// @access  Admin
export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, subject, term, description, order, isActive } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }

    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Topic name cannot be empty" });
      }
      topic.name = name.trim();
    }

    if (grade !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return res.status(400).json({ message: "Invalid grade ID" });
      }
      topic.grade = grade;
    }

    if (subject !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const subjectExists = await Subject.findById(subject).populate("grade", "name value");
      if (!subjectExists) {
        return res.status(404).json({ message: "Subject not found" });
      }

      if (!subjectExists.isActive) {
        return res.status(400).json({ message: "Subject is inactive" });
      }

      topic.subject = subject;

      // If grade is not explicitly passed, keep schema consistency by aligning with subject's grade
      if (!grade && subjectExists.grade) {
        topic.grade = subjectExists.grade._id;
      }
    }

    // Validate that topic.grade matches the grade of the selected subject
    if (topic.subject) {
      const subjectForValidation = await Subject.findById(topic.subject).populate("grade", "name value");

      if (!subjectForValidation) {
        return res.status(404).json({ message: "Subject not found" });
      }

      if (!subjectForValidation.grade || subjectForValidation.grade._id.toString() !== topic.grade.toString()) {
        return res.status(400).json({
          message: "Selected subject does not belong to the selected grade",
        });
      }
    }

    if (term !== undefined) {
      topic.term = term;
    }

    if (description !== undefined) {
      topic.description = description?.trim() || "";
    }

    if (order !== undefined) {
      topic.order = order;
    }

    if (isActive !== undefined) {
      topic.isActive = isActive;
    }

    const duplicateTopic = await Topic.findOne({
      _id: { $ne: topic._id },
      name: topic.name,
      grade: topic.grade,
      subject: topic.subject,
      term: topic.term,
    });

    if (duplicateTopic) {
      return res.status(400).json({
        message: "Topic already exists for this grade, subject, and term",
      });
    }

    const updatedTopic = await topic.save();

    const populatedTopic = await Topic.findById(updatedTopic._id)
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      });

    return res.json(populatedTopic);
  } catch (error) {
    console.error("Update topic error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Topic already exists for this grade, subject, and term",
      });
    }

    return res.status(500).json({ message: "Error updating topic" });
  }
};

// @desc    Delete topic
// @route   DELETE /api/topics/:id
// @access  Admin
export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }

    const topic = await Topic.findById(id);

    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    await topic.deleteOne();

    return res.json({ message: "Topic removed" });
  } catch (error) {
    console.error("Delete topic error:", error);
    return res.status(500).json({ message: "Error deleting topic" });
  }
};