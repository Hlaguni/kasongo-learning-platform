import mongoose from "mongoose";
import MCQ from "../models/MCQ.js";
import Lesson from "../models/Lesson.js";
import Enrollment from "../models/Enrollment.js";
import MCQAttempt from "../models/MCQAttempt.js";

// helper: validate one question
const validateQuestion = (question, index = 0) => {
  const {
    questionText = "",
    questionImageUrl = "",
    options,
    correctAnswer,
  } = question || {};

  if (!questionText.trim() && !questionImageUrl.trim()) {
    return `Question ${index + 1} must have text or image`;
  }

  if (!Array.isArray(options) || options.length < 2) {
    return `Question ${index + 1} must have at least 2 options`;
  }

  const cleanedOptions = options.map((opt) => (typeof opt === "string" ? opt.trim() : ""));

  if (cleanedOptions.some((opt) => !opt)) {
    return `Question ${index + 1} has an empty option`;
  }

  if (
    correctAnswer === undefined ||
    correctAnswer === null ||
    Number.isNaN(Number(correctAnswer))
  ) {
    return `Question ${index + 1} must have a valid correctAnswer index`;
  }

  const answerIndex = Number(correctAnswer);

  if (answerIndex < 0 || answerIndex >= cleanedOptions.length) {
    return `Question ${index + 1} correctAnswer is out of range`;
  }

  return null;
};

// @desc    Create MCQ for a lesson
// @route   POST /api/mcqs
// @access  Admin
export const createMCQ = async (req, res) => {
  try {
    const {
      lesson,
      instructions,
      questions = [],
      isPublished,
      isActive,
    } = req.body || {};

    if (!lesson) {
      return res.status(400).json({ message: "Lesson is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(lesson)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const lessonExists = await Lesson.findById(lesson)
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      })
      .populate({
        path: "topic",
        select: "name grade subject term isActive",
      });

    if (!lessonExists) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (!lessonExists.isActive) {
      return res.status(400).json({ message: "Lesson is inactive" });
    }

    const existingMCQ = await MCQ.findOne({ lesson });

    if (existingMCQ) {
      return res.status(400).json({ message: "MCQ already exists for this lesson" });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    for (let i = 0; i < questions.length; i++) {
      const errorMessage = validateQuestion(questions[i], i);
      if (errorMessage) {
        return res.status(400).json({ message: errorMessage });
      }
    }

    const cleanedQuestions = questions.map((q) => ({
      questionText: q.questionText?.trim() || "",
      questionImageUrl: q.questionImageUrl?.trim() || "",
      options: q.options.map((opt) => opt.trim()),
      correctAnswer: Number(q.correctAnswer),
      explanation: q.explanation?.trim() || "",
    }));

    const mcq = await MCQ.create({
      lesson,
      instructions: instructions?.trim() || "",
      questions: cleanedQuestions,
      isPublished: isPublished ?? false,
      isActive: isActive ?? true,
    });

    const populatedMCQ = await MCQ.findById(mcq._id).populate({
      path: "lesson",
      populate: [
        { path: "grade", select: "name value" },
        {
          path: "subject",
          select: "name grade isActive",
          populate: { path: "grade", select: "name value" },
        },
        { path: "topic", select: "name term isActive" },
      ],
    });

    return res.status(201).json(populatedMCQ);
  } catch (error) {
    console.error("Create MCQ error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "MCQ already exists for this lesson" });
    }

    return res.status(500).json({ message: "Error creating MCQ" });
  }
};

// @desc    Get all MCQs
// @route   GET /api/mcqs
// @access  Admin
export const getMCQs = async (req, res) => {
  try {
    const mcqs = await MCQ.find()
      .populate({
        path: "lesson",
        populate: [
          { path: "grade", select: "name value" },
          {
            path: "subject",
            select: "name grade isActive",
            populate: { path: "grade", select: "name value" },
          },
          { path: "topic", select: "name term isActive" },
        ],
      })
      .sort({ createdAt: -1 });

    return res.json(mcqs);
  } catch (error) {
    console.error("Get MCQs error:", error);
    return res.status(500).json({ message: "Error fetching MCQs" });
  }
};

// @desc    Get MCQ by lesson ID (Admin)
// @route   GET /api/mcqs/lesson/:lessonId
// @access  Admin
export const getMCQByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const mcq = await MCQ.findOne({ lesson: lessonId }).populate({
      path: "lesson",
      populate: [
        { path: "grade", select: "name value" },
        {
          path: "subject",
          select: "name grade isActive",
          populate: { path: "grade", select: "name value" },
        },
        { path: "topic", select: "name term isActive" },
      ],
    });

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found for this lesson" });
    }

    return res.json(mcq);
  } catch (error) {
    console.error("Get MCQ by lesson error:", error);
    return res.status(500).json({ message: "Error fetching MCQ" });
  }
};

// @desc    Get MCQ for student by lesson ID
// @route   GET /api/mcqs/student/lesson/:lessonId
// @access  Private/Student
export const getStudentMCQByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const mcq = await MCQ.findOne({
      lesson: lessonId,
      isPublished: true,
      isActive: true,
    }).populate({
      path: "lesson",
      populate: [
        { path: "grade", select: "name value" },
        {
          path: "subject",
          select: "name grade isActive isPublished",
          populate: { path: "grade", select: "name value" },
        },
        { path: "topic", select: "name term isActive isPublished" },
      ],
    });

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not available" });
    }

    const lesson = mcq.lesson;

    if (!lesson || !lesson.isPublished || !lesson.isActive) {
      return res.status(403).json({ message: "Lesson is not available" });
    }

    const allowedEnrollment = await Enrollment.findOne({
      student: req.user._id,
      grade: lesson.grade?._id || lesson.grade,
      subject: lesson.subject?._id || lesson.subject,
      paymentStatus: "paid",
      accessStatus: "active",
      isActive: true,
    });

    if (!allowedEnrollment) {
      return res.status(403).json({ message: "Access denied" });
    }

    const sanitizedMCQ = {
      _id: mcq._id,
      lesson: mcq.lesson,
      instructions: mcq.instructions,
      isPublished: mcq.isPublished,
      isActive: mcq.isActive,
      questions: mcq.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        questionImageUrl: q.questionImageUrl || "",
        options: q.options,
        explanation: q.explanation,
      })),
      createdAt: mcq.createdAt,
      updatedAt: mcq.updatedAt,
    };

    return res.json(sanitizedMCQ);
  } catch (error) {
    console.error("Get student MCQ error:", error);
    return res.status(500).json({ message: "Error fetching student MCQ" });
  }
};

// @desc    Submit MCQ answers
// @route   POST /api/mcqs/student/submit/:lessonId
// @access  Private/Student
export const submitStudentMCQ = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers = [] } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const mcq = await MCQ.findOne({
      lesson: lessonId,
      isPublished: true,
      isActive: true,
    }).populate({
      path: "lesson",
      populate: [
        { path: "grade", select: "name value" },
        {
          path: "subject",
          select: "name grade isActive isPublished",
          populate: { path: "grade", select: "name value" },
        },
        { path: "topic", select: "name term isActive isPublished" },
      ],
    });

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not available" });
    }

    const lesson = mcq.lesson;

    if (!lesson || !lesson.isPublished || !lesson.isActive) {
      return res.status(403).json({ message: "Lesson is not available" });
    }

    const allowedEnrollment = await Enrollment.findOne({
      student: req.user._id,
      grade: lesson.grade?._id || lesson.grade,
      subject: lesson.subject?._id || lesson.subject,
      paymentStatus: "paid",
      accessStatus: "active",
      isActive: true,
    });

    if (!allowedEnrollment) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔴 CHECK IF ALREADY ATTEMPTED
    const existingAttempt = await MCQAttempt.findOne({
      student: req.user._id,
      mcq: mcq._id,
    });

    if (existingAttempt) {
      return res.status(400).json({
        message: "You have already submitted this MCQ",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Answers must be an array" });
    }

    const results = mcq.questions.map((question, index) => {
      const selectedAnswer =
        answers[index] === undefined || answers[index] === null
          ? null
          : Number(answers[index]);

      const isCorrect = selectedAnswer === question.correctAnswer;

      return {
        questionId: question._id,
        selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = results.filter((r) => r.isCorrect).length;
    const totalQuestions = mcq.questions.length;
    const percentage = totalQuestions ? (score / totalQuestions) * 100 : 0;

    // 🔥 SAVE ATTEMPT
    await MCQAttempt.create({
      student: req.user._id,
      grade: lesson.grade?._id || lesson.grade,
      subject: lesson.subject?._id || lesson.subject,
      lesson: lesson._id,
      mcq: mcq._id,
      submittedAnswers: results.map((r) => ({
        questionId: r.questionId,
        selectedAnswer: r.selectedAnswer,
        correctAnswer: r.correctAnswer,
        isCorrect: r.isCorrect,
      })),
      score,
      totalQuestions,
      percentage,
    });

    return res.json({
      score,
      totalQuestions,
      percentage,
      results,
    });
  } catch (error) {
    console.error("Submit student MCQ error:", error);

    // 🔴 HANDLE DUPLICATE (from unique index)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted this MCQ",
      });
    }

    return res.status(500).json({ message: "Error submitting MCQ" });
  }
};

// @desc    Update MCQ
// @route   PUT /api/mcqs/:id
// @access  Admin
export const updateMCQ = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      lesson,
      instructions,
      questions,
      isPublished,
      isActive,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid MCQ ID" });
    }

    const mcq = await MCQ.findById(id);

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    if (lesson !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(lesson)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const lessonExists = await Lesson.findById(lesson);

      if (!lessonExists) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const duplicateLessonMCQ = await MCQ.findOne({
        _id: { $ne: mcq._id },
        lesson,
      });

      if (duplicateLessonMCQ) {
        return res.status(400).json({ message: "Another MCQ already exists for this lesson" });
      }

      mcq.lesson = lesson;
    }

    if (instructions !== undefined) {
      mcq.instructions = instructions?.trim() || "";
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "At least one question is required" });
      }

      for (let i = 0; i < questions.length; i++) {
        const errorMessage = validateQuestion(questions[i], i);
        if (errorMessage) {
          return res.status(400).json({ message: errorMessage });
        }
      }

      mcq.questions = questions.map((q) => ({
        questionText: q.questionText?.trim() || "",
        questionImageUrl: q.questionImageUrl?.trim() || "",
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: Number(q.correctAnswer),
        explanation: q.explanation?.trim() || "",
      }));
    }

    if (isPublished !== undefined) {
      mcq.isPublished = isPublished;
    }

    if (isActive !== undefined) {
      mcq.isActive = isActive;
    }

    const updatedMCQ = await mcq.save();

    const populatedMCQ = await MCQ.findById(updatedMCQ._id).populate({
      path: "lesson",
      populate: [
        { path: "grade", select: "name value" },
        {
          path: "subject",
          select: "name grade isActive",
          populate: { path: "grade", select: "name value" },
        },
        { path: "topic", select: "name term isActive" },
      ],
    });

    return res.json(populatedMCQ);
  } catch (error) {
    console.error("Update MCQ error:", error);

    if (error.code === 11000) {
      return res.status(400).json({ message: "MCQ already exists for this lesson" });
    }

    return res.status(500).json({ message: "Error updating MCQ" });
  }
};

// @desc    Delete MCQ
// @route   DELETE /api/mcqs/:id
// @access  Admin
export const deleteMCQ = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid MCQ ID" });
    }

    const mcq = await MCQ.findById(id);

    if (!mcq) {
      return res.status(404).json({ message: "MCQ not found" });
    }

    await mcq.deleteOne();

    return res.json({ message: "MCQ removed" });
  } catch (error) {
    console.error("Delete MCQ error:", error);
    return res.status(500).json({ message: "Error deleting MCQ" });
  }
};