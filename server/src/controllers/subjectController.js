import mongoose from "mongoose";
import Subject from "../models/Subject.js";
import Grade from "../models/Grade.js";
import Enrollment from "../models/Enrollment.js";
import Topic from "../models/Topic.js";
import Lesson from "../models/Lesson.js";
import MCQ from "../models/MCQ.js";

// @desc Create subject
// @route POST /api/subjects
// @access Admin
export const createSubject = async (req, res) => {
  try {
    const { name, grade } = req.body || {};

    if (!name || !grade) {
      return res.status(400).json({ message: "Name and grade are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(grade)) {
      return res.status(400).json({ message: "Invalid grade ID" });
    }

    const gradeExists = await Grade.findById(grade);
    if (!gradeExists) {
      return res.status(404).json({ message: "Grade not found" });
    }

    const existing = await Subject.findOne({
      name: name.trim(),
      grade,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Subject already exists for this grade" });
    }

    const subject = await Subject.create({
      name: name.trim(),
      grade,
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error("Create subject error:", error);
    res.status(500).json({ message: "Error creating subject" });
  }
};

// @desc Get student's enrolled subjects
// @route GET /api/subjects/my-subjects
// @access Student
export const getMySubjects = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrollments = await Enrollment.find({
      student: studentId,
      paymentStatus: "paid",
      accessStatus: "active",
      isActive: true,
    })
      .populate("subject", "name grade isActive")
      .populate("grade", "name value");

    if (!enrollments.length) {
      return res.status(200).json([]);
    }

    const subjects = await Promise.all(
      enrollments
        .filter(
          (enrollment) =>
            enrollment.subject &&
            enrollment.grade &&
            enrollment.subject.isActive !== false
        )
        .map(async (enrollment) => {
          const subjectId = enrollment.subject._id;
          const gradeId = enrollment.grade._id;

          const [topicsCount, lessonsCount, lessons] = await Promise.all([
            Topic.countDocuments({
              subject: subjectId,
              grade: gradeId,
              isActive: true,
            }),
            Lesson.countDocuments({
              subject: subjectId,
              grade: gradeId,
              isActive: true,
            }),
            Lesson.find({
              subject: subjectId,
              grade: gradeId,
              isActive: true,
            }).select("_id"),
          ]);

          const lessonIds = lessons.map((lesson) => lesson._id);

          const quizzesCount = await MCQ.countDocuments({
            lesson: { $in: lessonIds },
            isActive: true,
          });

          return {
            _id: enrollment.subject._id,
            name: enrollment.subject.name,
            grade: enrollment.grade,
            topicsCount,
            lessonsCount,
            quizzesCount,
          };
        })
    );

    res.status(200).json(subjects);
  } catch (error) {
    console.error("Get my subjects error:", error);
    res.status(500).json({ message: "Error fetching student subjects" });
  }
};

// @desc Get subjects (optionally by grade)
// @route GET /api/subjects
// @access Public
export const getSubjects = async (req, res) => {
  try {
    const { grade } = req.query;
    const filter = { isActive: true };

    if (grade) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return res.status(400).json({ message: "Invalid grade ID" });
      }

      filter.grade = grade;
    }

    const subjects = await Subject.find(filter)
      .populate("grade", "name value")
      .sort({ name: 1 });

    res.json(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ message: "Error fetching subjects" });
  }
};

// @desc Get single subject by ID
// @route GET /api/subjects/:id
// @access Public
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    const subject = await Subject.findById(id).populate("grade", "name value");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (error) {
    console.error("Get subject by ID error:", error);
    res.status(500).json({ message: "Error fetching subject" });
  }
};

// @desc Update subject
// @route PUT /api/subjects/:id
// @access Admin
export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, grade, isActive } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (name !== undefined) {
      subject.name = name.trim();
    }

    if (grade !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return res.status(400).json({ message: "Invalid grade ID" });
      }

      const gradeExists = await Grade.findById(grade);
      if (!gradeExists) {
        return res.status(404).json({ message: "Grade not found" });
      }

      subject.grade = grade;
    }

    if (isActive !== undefined) {
      subject.isActive = isActive;
    }

    const duplicate = await Subject.findOne({
      _id: { $ne: subject._id },
      name: subject.name,
      grade: subject.grade,
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ message: "Subject already exists for this grade" });
    }

    const updated = await subject.save();

    const populatedSubject = await Subject.findById(updated._id).populate(
      "grade",
      "name value"
    );

    res.json(populatedSubject);
  } catch (error) {
    console.error("Update subject error:", error);
    res.status(500).json({ message: "Error updating subject" });
  }
};

// @desc Delete subject
// @route DELETE /api/subjects/:id
// @access Admin
export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    const subject = await Subject.findById(id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.deleteOne();

    res.json({ message: "Subject removed" });
  } catch (error) {
    console.error("Delete subject error:", error);
    res.status(500).json({ message: "Error deleting subject" });
  }
};