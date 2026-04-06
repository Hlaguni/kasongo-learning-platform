import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import mcqRoutes from "./routes/mcqRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

// Connect to DB
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://kasongo-learning-platform-i1xi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: {
    message: "Too many requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

// Routes with rate limiting
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/grades", apiLimiter, gradeRoutes);
app.use("/api/subjects", apiLimiter, subjectRoutes);
app.use("/api/topics", apiLimiter, topicRoutes);
app.use("/api/enrollments", apiLimiter, enrollmentRoutes);
app.use("/api/lessons", apiLimiter, lessonRoutes);
app.use("/api/mcqs", apiLimiter, mcqRoutes);
app.use("/api/results", apiLimiter, resultRoutes);
app.use("/api/students", apiLimiter, studentRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Kasongo API is running...");
});

// Error fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});