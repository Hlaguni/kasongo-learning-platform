import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js"
import topicRoutes from "./routes/topicRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js"
import lessonRoutes from "./routes/lessonRoutes.js";
import mcqRoutes from "./routes/mcqRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/mcqs", mcqRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/students", studentRoutes);
// Default route
app.get("/", (req, res) => {
  res.send("Kasongo API is running...");
});

// Error fallback (optional but useful)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});