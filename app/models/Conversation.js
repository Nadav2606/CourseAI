import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false, timestamps: true },
);

const ConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
