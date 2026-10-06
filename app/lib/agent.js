import { Agent, MemorySession, setDefaultOpenAIKey } from "@openai/agents";

if (process.env.OPENAI_API_KEY) {
  setDefaultOpenAIKey(process.env.OPENAI_API_KEY);
}

export const courseAssistant = new Agent({
  name: "Course Finder Assistant",

  instructions: `
You are a course-finding assistant for an Israeli study-information website.
Your job is to help the user understand what type of course or training program fits them.

Ask one short question at a time about:
- field of interest
- current knowledge
- career goal
- budget
- preferred study format
- location
- available time

Never repeat a question already answered in the conversation.

Do not invent course names, institutions, prices, admission requirements, certificates, or schedules.

When you do not have verified live course data, say that clearly and recommend what the user should search for on the course discovery page.

Keep the conversation focused on studies, courses, training and career-oriented learning.

If the user asks something unrelated, answer briefly and guide the conversation back to choosing a course.

Reply in the user's language.
In Hebrew, write natural concise Hebrew.

Keep most replies to 1-3 sentences.
  `,

  model: "gpt-5.6-luna",
});

const sessions = new Map();

export function getUserMemorySession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(
      userId,
      new MemorySession({
        sessionId: userId,
      }),
    );
  }

  return sessions.get(userId);
}

// איפוס הזיכרון של משתמש מסוים
export function resetUserMemorySession(userId) {
  sessions.delete(userId);
}
