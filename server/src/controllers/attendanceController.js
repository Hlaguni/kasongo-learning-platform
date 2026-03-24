import Attendance from "../models/Attendance.js";

export const markAttendance = async (req, res) => {
  try {
    const { student, date, status, note } = req.body;

    if (!student || !date || !status) {
      return res.status(400).json({
        message: "Student, date, and status are required",
      });
    }

    const existingAttendance = await Attendance.findOne({
      student,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Attendance already marked for this student on this date",
      });
    }

    const attendance = await Attendance.create({
      student,
      date: new Date(date),
      status,
      note,
      markedBy: req.user._id,
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user._id })
      .sort({ date: -1 })
      .populate("markedBy", "name email");

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .sort({ date: -1 })
      .populate("student", "name email")
      .populate("markedBy", "name email");

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};