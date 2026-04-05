import mongoose from "mongoose";
import Lesson from "../models/Lesson.js";
import Topic from "../models/Topic.js";
import Enrollment from "../models/Enrollment.js";
import MCQ from "../models/MCQ.js";

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Admin
export const createLesson = async (req, res) => {
  try {
    const {
      title,
      lessonNumber,
      grade,
      subject,
      topic,
      term,
      videoUrl,
      pdfUrl,
      description,
      isPublished,
      isActive,
      order,
    } = req.body || {};

    if (!title || lessonNumber === undefined || !grade || !subject || !topic || !term) {
      return res.status(400).json({
        message: "Title, lessonNumber, grade, subject, topic, and term are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(grade)) {
      return res.status(400).json({ message: "Invalid grade ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(topic)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }

    const topicExists = await Topic.findById(topic)
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      });

    if (!topicExists) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (!topicExists.isActive) {
      return res.status(400).json({ message: "Topic is inactive" });
    }

    if (topicExists.grade?._id?.toString() !== grade.toString()) {
      return res.status(400).json({
        message: "Selected topic does not belong to the selected grade",
      });
    }

    if (topicExists.subject?._id?.toString() !== subject.toString()) {
      return res.status(400).json({
        message: "Selected topic does not belong to the selected subject",
      });
    }

    if (topicExists.term !== term) {
      return res.status(400).json({
        message: "Selected topic does not belong to the selected term",
      });
    }

    const existingLesson = await Lesson.findOne({
      topic,
      lessonNumber,
    });

    if (existingLesson) {
      return res.status(400).json({
        message: "Lesson number already exists for this topic",
      });
    }

    const lesson = await Lesson.create({
      title: title.trim(),
      lessonNumber,
      grade,
      subject,
      topic,
      term,
      videoUrl: videoUrl?.trim() || "",
      pdfUrl: pdfUrl?.trim() || "",
      description: description?.trim() || "",
      isPublished: isPublished ?? false,
      isActive: isActive ?? true,
      order: order ?? 0,
    });

    const populatedLesson = await Lesson.findById(lesson._id)
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
        populate: [
          { path: "grade", select: "name value" },
          {
            path: "subject",
            select: "name grade",
            populate: { path: "grade", select: "name value" },
          },
        ],
      });

    return res.status(201).json(populatedLesson);
  } catch (error) {
    console.error("Create lesson error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Lesson number already exists for this topic",
      });
    }

    return res.status(500).json({ message: "Error creating lesson" });
  }
};

// @desc    Get all lessons
// @route   GET /api/lessons
// @access  Admin
export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
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
      })
      .sort({ term: 1, order: 1, lessonNumber: 1, title: 1 });

    return res.json(lessons);
  } catch (error) {
    console.error("Get lessons error:", error);
    return res.status(500).json({ message: "Error fetching lessons" });
  }
};

// @desc    Get student lessons based on active enrollments
// @route   GET /api/lessons/my-lessons
// @access  Private/Student
export const getLessonsForStudent = async (req, res) => {
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

    const lessons = await Lesson.find({
      isActive: true,
      isPublished: true,
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
      .populate({
        path: "topic",
        select: "name grade subject term isActive",
      })
      .sort({ term: 1, order: 1, lessonNumber: 1, title: 1 });

    // Attach hasMCQ flag
const lessonsWithMCQ = await Promise.all(
  lessons.map(async (lesson) => {
    const mcqExists = await MCQ.exists({ lesson: lesson._id });

    return {
      ...lesson.toObject(),
      hasMCQ: !!mcqExists,
    };
  })
);

return res.json(lessonsWithMCQ);;
  } catch (error) {
    console.error("Get lessons for student error:", error);
    return res.status(500).json({ message: "Error fetching student lessons" });
  }
};

// @desc    Get lessons by topic
// @route   GET /api/lessons/topic/:topicId
// @access  Admin
export const getLessonsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ message: "Invalid topic ID" });
    }

    const lessons = await Lesson.find({ topic: topicId })
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
      })
      .sort({ order: 1, lessonNumber: 1, title: 1 });

    return res.json(lessons);
  } catch (error) {
    console.error("Get lessons by topic error:", error);
    return res.status(500).json({ message: "Error fetching lessons by topic" });
  }
};

// @desc    Get single lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const lesson = await Lesson.findById(id)
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
        populate: [
          { path: "grade", select: "name value" },
          {
            path: "subject",
            select: "name grade",
            populate: { path: "grade", select: "name value" },
          },
        ],
      });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (req.user.role === "student") {
      const allowedEnrollment = await Enrollment.findOne({
        student: req.user._id,
        grade: lesson.grade._id || lesson.grade,
        subject: lesson.subject._id,
        accessStatus: "active",
        isActive: true,
      });

      if (!allowedEnrollment) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (!lesson.isPublished || !lesson.isActive) {
        return res.status(403).json({ message: "Lesson is not available" });
      }
    }

    return res.json(lesson);
  } catch (error) {
    console.error("Get lesson by ID error:", error);
    return res.status(500).json({ message: "Error fetching lesson" });
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Admin
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      lessonNumber,
      grade,
      subject,
      topic,
      term,
      videoUrl,
      pdfUrl,
      description,
      isPublished,
      isActive,
      order,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ message: "Lesson title cannot be empty" });
      }
      lesson.title = title.trim();
    }

    if (lessonNumber !== undefined) {
      lesson.lessonNumber = lessonNumber;
    }

    if (grade !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return res.status(400).json({ message: "Invalid grade ID" });
      }
      lesson.grade = grade;
    }

    if (subject !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }
      lesson.subject = subject;
    }

    if (topic !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(topic)) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      lesson.topic = topic;
    }

    if (term !== undefined) {
      lesson.term = term;
    }

    if (videoUrl !== undefined) {
      lesson.videoUrl = videoUrl?.trim() || "";
    }

    if (pdfUrl !== undefined) {
      lesson.pdfUrl = pdfUrl?.trim() || "";
    }

    if (description !== undefined) {
      lesson.description = description?.trim() || "";
    }

    if (isPublished !== undefined) {
      lesson.isPublished = isPublished;
    }

    if (isActive !== undefined) {
      lesson.isActive = isActive;
    }

    if (order !== undefined) {
      lesson.order = order;
    }

    const topicForValidation = await Topic.findById(lesson.topic)
      .populate("grade", "name value")
      .populate({
        path: "subject",
        select: "name grade isActive",
        populate: {
          path: "grade",
          select: "name value",
        },
      });

    if (!topicForValidation) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (!topicForValidation.isActive) {
      return res.status(400).json({ message: "Topic is inactive" });
    }

    if (topicForValidation.grade?._id?.toString() !== lesson.grade.toString()) {
      return res.status(400).json({
        message: "Selected topic does not belong to the selected grade",
      });
    }

    if (topicForValidation.subject?._id?.toString() !== lesson.subject.toString()) {
      return res.status(400).json({
        message: "Selected topic does not belong to the selected subject",
      });
    }

    if (topicForValidation.term !== lesson.term) {
      return res.status(400).json({
        message: "Selected topic does not belong to the selected term",
      });
    }

    const duplicateLesson = await Lesson.findOne({
      _id: { $ne: lesson._id },
      topic: lesson.topic,
      lessonNumber: lesson.lessonNumber,
    });

    if (duplicateLesson) {
      return res.status(400).json({
        message: "Lesson number already exists for this topic",
      });
    }

    const updatedLesson = await lesson.save();

    const populatedLesson = await Lesson.findById(updatedLesson._id)
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
        populate: [
          { path: "grade", select: "name value" },
          {
            path: "subject",
            select: "name grade",
            populate: { path: "grade", select: "name value" },
          },
        ],
      });

    return res.json(populatedLesson);
  } catch (error) {
    console.error("Update lesson error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Lesson number already exists for this topic",
      });
    }

    return res.status(500).json({ message: "Error updating lesson" });
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Admin
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await lesson.deleteOne();

    return res.json({ message: "Lesson removed" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    return res.status(500).json({ message: "Error deleting lesson" });
  }
};