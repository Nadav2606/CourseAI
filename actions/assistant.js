"use server";

import { run } from "@openai/agents";
import { getSessionUser } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Course from "@/app/models/Course";
import Conversation from "@/app/models/Conversation";
import {
  courseAssistant,
  getUserMemorySession,
  resetUserMemorySession,
} from "@/app/lib/agent";

const MAX_MESSAGE_LENGTH = 1000;

export async function askAgentAction(prevState, formData) {
  const user = await getSessionUser();
  if (!user) return { answer: "", error: "צריך להתחבר קודם." };

  const message = String(formData.get("message") || "").trim();
  if (!message) return { answer: "", error: "נא לכתוב הודעה." };
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { answer: "", error: "ההודעה ארוכה מדי." };
  }

  try {
    await connectDB();

    const savedCourses = await Course.find({ userId: user.id })
      .select("title provider category notes")
      .lean();

    const savedCoursesContext = savedCourses.length
      ? savedCourses
          .map(
            (course) =>
              `- ${course.title}${course.provider ? ` | ${course.provider}` : ""}${course.category ? ` | ${course.category}` : ""}`,
          )
          .join("\n")
      : "אין למשתמש קורסים שמורים כרגע.";

    const input = `${message}\n\nנתוני המשתמש מתוך האפליקציה - קורסים שמורים:\n${savedCoursesContext}`;
    const session = getUserMemorySession(user.id);
    const result = await run(courseAssistant, input, { session });
    const answer = result.finalOutput || "";

    await Conversation.findOneAndUpdate(
      { userId: user.id },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", text: message },
              { role: "assistant", text: answer },
            ],
          },
        },
      },
      { upsert: true, new: true },
    );

    return { answer, error: "" };
  } catch (error) {
    console.error("Course agent error:", error);
    return { answer: "", error: "הסוכן לא הצליח לענות כרגע. נסה שוב." };
  }
}

export async function resetAgentAction() {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "צריך להתחבר קודם." };

  await connectDB();
  await Conversation.deleteOne({ userId: user.id });
  resetUserMemorySession(user.id);

  return { success: true };
}
