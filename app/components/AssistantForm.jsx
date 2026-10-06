"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { askAgentAction, resetAgentAction } from "@/actions/assistant";

const initialState = {
  answer: "",
  error: "",
};

export default function AssistantForm({ initialMessages = [] }) {
  const [state, action, pending] = useActionState(askAgentAction, initialState);

  const [messages, setMessages] = useState(
    initialMessages.length
      ? initialMessages
      : [
          {
            role: "assistant",
            text: "היי! ספר לי מה היית רוצה ללמוד או באיזה תחום היית רוצה לעבוד.",
          },
        ],
  );

  const [currentMessage, setCurrentMessage] = useState("");

  const bottomRef = useRef(null);
  const lastAnswerRef = useRef("");

  // מוסיף את תשובת הסוכן להיסטוריית הצ'אט
  useEffect(() => {
    if (state.answer && state.answer !== lastAnswerRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: state.answer,
        },
      ]);

      lastAnswerRef.current = state.answer;
    }
  }, [state.answer]);

  // גלילה אוטומטית להודעה האחרונה
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, pending]);

  function handleSubmit() {
    const message = currentMessage.trim();

    if (!message) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: message,
      },
    ]);

    setCurrentMessage("");
  }

  // התחלת שיחה חדשה
  async function handleNewChat() {
    const result = await resetAgentAction();

    if (!result.success) {
      return;
    }

    setMessages([
      {
        role: "assistant",
        text: "היי! התחלנו שיחה חדשה. ספר לי מה היית רוצה ללמוד או באיזה תחום היית רוצה לעבוד.",
      },
    ]);

    setCurrentMessage("");
    lastAnswerRef.current = "";
  }

  return (
    <div className="card chat">
      <div className="chatHead">
        <div>
          <b>סוכן התאמת הקורסים</b>
          <span>עוזר לבחור כיוון לימודים</span>
        </div>

        <button
          type="button"
          className="newChatButton"
          onClick={handleNewChat}
          disabled={pending}
        >
          + שיחה חדשה
        </button>
      </div>

      <div className="chatMessages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.role === "user" ? "userMessage" : "assistantMessage"
            }`}
          >
            <span className="messageName">
              {message.role === "user" ? "אתה" : "CourseAI"}
            </span>

            <p>{message.text}</p>
          </div>
        ))}

        {pending && (
          <div className="message assistantMessage">
            <span className="messageName">CourseAI</span>

            <p>חושב...</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {state.error && <p className="error">{state.error}</p>}

      <form action={action} onSubmit={handleSubmit} className="chatForm">
        <textarea
          id="message"
          name="message"
          maxLength="1000"
          rows="2"
          placeholder="כתוב הודעה..."
          required
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          disabled={pending}
        />

        <button className="button" disabled={pending}>
          {pending ? "חושב..." : "שליחה"}
        </button>
      </form>
    </div>
  );
}
