import mongoose from "mongoose";

const mcqQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      trim: true,
      default: "",
    },
    questionImageUrl: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: "Each question must have at least 2 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
    },
    explanation: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true }
);

const mcqSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      unique: true,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    questions: {
      type: [mcqQuestionSchema],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MCQ", mcqSchema);