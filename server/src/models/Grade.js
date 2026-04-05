import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Grade name is required"],
      trim: true,
      unique: true,
    },
    value: {
      type: Number,
      required: [true, "Grade value is required"],
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);