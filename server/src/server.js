import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import seedTopics from "./utils/seedTopics.js";
import topicRoutes from "./routes/topicRoutes.js";

dotenv.config();

connectDB();
seedTopics();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://kasongo-learning.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Request origin:", origin);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lesson", lessonRoutes)
app.use("/api/attendance", attendanceRoutes);
app.use("/api/topics", topicRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});