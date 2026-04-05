import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Grade from "../models/Grade.js";
import Subject from "../models/Subject.js";

// @desc    Create enrollment
// @route   POST /api/enrollments
// @access  Admin
export const createEnrollment = async (req, res) => {
  try {
    const {
      student,
      grade,
      subject,
      paymentStatus,
      accessStatus,
      startDate,
      expiryDate,
      amountPaid,
      isActive,
    } = req.body || {};

    if (!student || !grade || !subject) {
      return res.status(400).json({
        message: "Student, grade, and subject are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(student) ||
      !mongoose.Types.ObjectId.isValid(grade) ||
      !mongoose.Types.ObjectId.isValid(subject)
    ) {
      return res.status(400).json({
        message: "Invalid student, grade, or subject ID",
      });
    }

    const existingStudent = await User.findById(student);
    if (!existingStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (existingStudent.role !== "student") {
      return res.status(400).json({ message: "Selected user is not a student" });
    }

    const existingGrade = await Grade.findById(grade);
    if (!existingGrade) {
      return res.status(404).json({ message: "Grade not found" });
    }

    const existingSubject = await Subject.findById(subject);
    if (!existingSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (!existingSubject.isActive) {
      return res.status(400).json({ message: "Subject is inactive" });
    }

    if (existingSubject.grade.toString() !== grade.toString()) {
      return res.status(400).json({
        message: "Subject does not belong to the selected grade",
      });
    }

    const duplicateEnrollment = await Enrollment.findOne({
      student,
      grade,
      subject,
    });

    if (duplicateEnrollment) {
      return res.status(400).json({
        message: "Student is already enrolled in this subject for this grade",
      });
    }

    const enrollment = await Enrollment.create({
      student,
      grade,
      subject,
      paymentStatus: paymentStatus || "pending",
      accessStatus: accessStatus || "inactive",
      startDate: startDate || Date.now(),
      expiryDate: expiryDate || null,
      amountPaid: amountPaid ?? 0,
      isActive: isActive ?? true,
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "name email role")
      .populate("grade", "name value")
      .populate("subject", "name");

    return res.status(201).json(populatedEnrollment);
  } catch (error) {
    console.error("Create enrollment error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate enrollment is not allowed",
      });
    }

    return res.status(500).json({
      message: "Error creating enrollment",
    });
  }
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Admin
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "name email role")
      .populate("grade", "name value")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    return res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments error:", error);
    return res.status(500).json({
      message: "Error fetching enrollments",
    });
  }
};

// @desc    Get single enrollment by ID
// @route   GET /api/enrollments/:id
// @access  Admin
export const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid enrollment ID" });
    }

    const enrollment = await Enrollment.findById(id)
      .populate("student", "name email role")
      .populate("grade", "name value")
      .populate("subject", "name");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    return res.json(enrollment);
  } catch (error) {
    console.error("Get enrollment by ID error:", error);
    return res.status(500).json({
      message: "Error fetching enrollment",
    });
  }
};

// @desc    Get enrollments for one student
// @route   GET /api/enrollments/student/:studentId
// @access  Admin
export const getEnrollmentsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrollments = await Enrollment.find({ student: studentId })
      .populate("student", "name email role")
      .populate("grade", "name value")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    return res.json(enrollments);
  } catch (error) {
    console.error("Get enrollments by student error:", error);
    return res.status(500).json({
      message: "Error fetching student enrollments",
    });
  }
};

// @desc    Get current student's enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private (Student)
export const getMyEnrollments = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        message: "Access denied. Students only.",
      });
    }

    const enrollments = await Enrollment.find({
      student: req.user._id,
      isActive: true,
    })
      .populate("grade", "name value")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    return res.json(enrollments);
  } catch (error) {
    console.error("Get my enrollments error:", error);
    return res.status(500).json({
      message: "Error fetching your enrollments",
    });
  }
};

// @desc    Update enrollment
// @route   PUT /api/enrollments/:id
// @access  Admin
export const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student,
      grade,
      subject,
      paymentStatus,
      accessStatus,
      startDate,
      expiryDate,
      amountPaid,
      isActive,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid enrollment ID" });
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    if (student !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(student)) {
        return res.status(400).json({ message: "Invalid student ID" });
      }

      const existingStudent = await User.findById(student);
      if (!existingStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (existingStudent.role !== "student") {
        return res.status(400).json({ message: "Selected user is not a student" });
      }

      enrollment.student = student;
    }

    if (grade !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return res.status(400).json({ message: "Invalid grade ID" });
      }

      const existingGrade = await Grade.findById(grade);
      if (!existingGrade) {
        return res.status(404).json({ message: "Grade not found" });
      }

      enrollment.grade = grade;
    }

    if (subject !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }

      const existingSubject = await Subject.findById(subject);
      if (!existingSubject) {
        return res.status(404).json({ message: "Subject not found" });
      }

      if (!existingSubject.isActive) {
        return res.status(400).json({ message: "Subject is inactive" });
      }

      enrollment.subject = subject;
    }

    const finalSubject = await Subject.findById(enrollment.subject);
    if (!finalSubject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (finalSubject.grade.toString() !== enrollment.grade.toString()) {
      return res.status(400).json({
        message: "Subject does not belong to the selected grade",
      });
    }

    if (paymentStatus !== undefined) {
      enrollment.paymentStatus = paymentStatus;
    }

    if (accessStatus !== undefined) {
      enrollment.accessStatus = accessStatus;
    }

    if (startDate !== undefined) {
      enrollment.startDate = startDate;
    }

    if (expiryDate !== undefined) {
      enrollment.expiryDate = expiryDate;
    }

    if (amountPaid !== undefined) {
      enrollment.amountPaid = amountPaid;
    }

    if (isActive !== undefined) {
      enrollment.isActive = isActive;
    }

    const duplicateEnrollment = await Enrollment.findOne({
      _id: { $ne: enrollment._id },
      student: enrollment.student,
      grade: enrollment.grade,
      subject: enrollment.subject,
    });

    if (duplicateEnrollment) {
      return res.status(400).json({
        message: "Student is already enrolled in this subject for this grade",
      });
    }

    const updatedEnrollment = await enrollment.save();

    const populatedEnrollment = await Enrollment.findById(updatedEnrollment._id)
      .populate("student", "name email role")
      .populate("grade", "name value")
      .populate("subject", "name");

    return res.json(populatedEnrollment);
  } catch (error) {
    console.error("Update enrollment error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate enrollment is not allowed",
      });
    }

    return res.status(500).json({
      message: "Error updating enrollment",
    });
  }
};

// @desc    Delete enrollment
// @route   DELETE /api/enrollments/:id
// @access  Admin
export const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid enrollment ID" });
    }

    const enrollment = await Enrollment.findById(id);

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    await enrollment.deleteOne();

    return res.json({ message: "Enrollment removed" });
  } catch (error) {
    console.error("Delete enrollment error:", error);
    return res.status(500).json({
      message: "Error deleting enrollment",
    });
  }
};