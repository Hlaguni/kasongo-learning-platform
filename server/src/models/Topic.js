import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Topic name is required"],
      trim: true,
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Grade is required"],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: [true, "Subject is required"],
    },
    term: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: [true, "Term is required"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
      min: [1, "Order must be at least 1"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate topics in the same grade, subject, and term
topicSchema.index({ name: 1, grade: 1, subject: 1, term: 1 }, { unique: true });

// Helpful for sorting/filtering
topicSchema.index({ grade: 1, subject: 1, term: 1, order: 1 });

export default mongoose.model("Topic", topicSchema);