import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
    },
    lessonNumber: {
      type: Number,
      required: [true, "Lesson number is required"],
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    term: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: true,
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate lesson numbers inside the same topic
lessonSchema.index({ topic: 1, lessonNumber: 1 }, { unique: true });

export default mongoose.model("Lesson", lessonSchema);