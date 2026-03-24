import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    grade: {
      type: Number,
      default: 10,
    },
  },
  { timestamps: true }
);

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;