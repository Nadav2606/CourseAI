import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    provider: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    sourceUrl: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
