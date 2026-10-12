import mongoose from "mongoose";

const schema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: String,
  description: String,
  content: { type: String, default: "" },
  contentFetchedAt: Date,
  focusedInfo: mongoose.Schema.Types.Mixed,
  infoVersion: Number,
  infoSourceHash: String,
  provider: String,
  category: String,
  url: String,
}, { timestamps: true });

export default mongoose.models.DiscoveredCourse || mongoose.model("DiscoveredCourse", schema);
