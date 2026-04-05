import mongoose from "mongoose";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findById(id).select("-password");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    res.status(500).json({ message: "Server error while fetching student" });
  }
};

export const getStudentEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findById(id).select("_id role name email");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const enrollments = await Enrollment.find({ student: id })
      .populate("grade", "name value")
      .populate("subject", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
      },
      enrollments,
    });
  } catch (error) {
    console.error("Error fetching student enrollments:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching student enrollments" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { search, isActive, grade, subject, accessStatus } = req.query;

    const userFilter = {
      role: "student",
    };

    if (typeof isActive !== "undefined") {
      userFilter.isActive = isActive === "true";
    }

    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const hasEnrollmentFilters = grade || subject || accessStatus;

    // Case 1: no enrollment filters, query users directly
    if (!hasEnrollmentFilters) {
      const students = await User.find(userFilter)
        .select("-password")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: students.length,
        students,
      });
    }

    // Case 2: enrollment filters exist
    const enrollmentFilter = {};

    if (grade) {
      if (!mongoose.Types.ObjectId.isValid(grade)) {
        return res.status(400).json({ message: "Invalid grade ID" });
      }
      enrollmentFilter.grade = grade;
    }

    if (subject) {
      if (!mongoose.Types.ObjectId.isValid(subject)) {
        return res.status(400).json({ message: "Invalid subject ID" });
      }
      enrollmentFilter.subject = subject;
    }

    if (accessStatus) {
      enrollmentFilter.accessStatus = accessStatus;
    }

    const enrollments = await Enrollment.find(enrollmentFilter).select("student");
    const studentIds = [...new Set(enrollments.map((enrollment) => enrollment.student.toString()))];

    // If no matching enrollments, return empty result early
    if (studentIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        students: [],
      });
    }

    userFilter._id = { $in: studentIds };

    const students = await User.find(userFilter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error while fetching students" });
  }
};