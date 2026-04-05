import mongoose from "mongoose";
import MCQAttempt from "../models/MCQAttempt.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildPopulatedQuery = (filter = {}) => {
  return MCQAttempt.find(filter)
    .select("-submittedAnswers")
    .populate("student", "name email")
    .populate("grade", "name")
    .populate("subject", "name")
    .populate("lesson", "title")
    .sort({ submittedAt: -1 });
};

export const getAllResults = async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);
    const skip = (page - 1) * limit;

    const totalResults = await MCQAttempt.countDocuments();

    const results = await MCQAttempt.find()
      .select("-submittedAnswers")
      .populate("student", "name email")
      .populate("grade", "name")
      .populate("subject", "name")
      .populate("lesson", "title")
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalResults / limit);

    res.status(200).json({
      page,
      limit,
      totalResults,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch all results",
      error: error.message,
    });
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidObjectId(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const results = await buildPopulatedQuery({ student: studentId });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student results",
      error: error.message,
    });
  }
};

export const getLessonResults = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!isValidObjectId(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const results = await buildPopulatedQuery({ lesson: lessonId });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lesson results",
      error: error.message,
    });
  }
};

export const getSubjectResults = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!isValidObjectId(subjectId)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    const results = await buildPopulatedQuery({ subject: subjectId });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch subject results",
      error: error.message,
    });
  }
};

export const getMCQResults = async (req, res) => {
  try {
    const { mcqId } = req.params;

    if (!isValidObjectId(mcqId)) {
      return res.status(400).json({ message: "Invalid MCQ ID" });
    }

    const results = await buildPopulatedQuery({ mcq: mcqId });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch MCQ results",
      error: error.message,
    });
  }
};

export const getMyResults = async (req, res) => {
  try {
    const results = await MCQAttempt.find({ student: req.user._id })
      .select("-submittedAnswers")
      .populate("grade", "name")
      .populate("subject", "name")
      .populate("lesson", "title")
      .sort({ submittedAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your results",
      error: error.message,
    });
  }
};

export const getResultSummary = async (req, res) => {
  try {
    const totalAttempts = await MCQAttempt.countDocuments();

    const averageStats = await MCQAttempt.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$score" },
          averagePercentage: { $avg: "$percentage" },
          highestPercentage: { $max: "$percentage" },
          lowestPercentage: { $min: "$percentage" },
          passCount: {
            $sum: {
              $cond: [{ $gte: ["$percentage", 50] }, 1, 0],
            },
          },
          failCount: {
            $sum: {
              $cond: [{ $lt: ["$percentage", 50] }, 1, 0],
            },
          },
        },
      },
    ]);

    const stats = averageStats[0] || {};

    const topResults = await MCQAttempt.find()
      .select("-submittedAnswers")
      .populate("student", "name email")
      .populate("subject", "name")
      .populate("lesson", "title")
      .sort({ percentage: -1, submittedAt: -1 })
      .limit(10);

    res.status(200).json({
      totalAttempts,
      averageScore: Number((stats.averageScore || 0).toFixed(2)),
      averagePercentage: Number((stats.averagePercentage || 0).toFixed(2)),
      highestPercentage: stats.highestPercentage || 0,
      lowestPercentage: stats.lowestPercentage || 0,
      passCount: stats.passCount || 0,
      failCount: stats.failCount || 0,
      topResults,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch result summary",
      error: error.message,
    });
  }
};