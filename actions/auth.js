"use server";

import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/app/lib/session";
import { authenticateUser, createUserWithPassword } from "@/app/lib/auth";

export async function registerAction(prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const errors = {};

  if (name.length < 2) {
    errors.name = "השם חייב להכיל לפחות 2 תווים";
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "כתובת האימייל אינה תקינה";
  }

  if (password.length < 8) {
    errors.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
  }

  if (Object.keys(errors).length) {
    return {
      errors,
      values: { name, email },
      message: "",
    };
  }

  try {
    const user = await createUserWithPassword({
      name,
      email,
      password,
    });

    await createSession(user._id.toString());
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.message === "EMAIL_EXISTS") {
      return {
        errors: { email: "האימייל כבר רשום" },
        values: { name, email },
        message: "",
      };
    }

    return {
      errors: {},
      values: { name, email },
      message: "לא הצלחנו ליצור משתמש",
    };
  }

  redirect("/");
}

export async function loginAction(prevState, formData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await authenticateUser(email, password);

  if (!user) {
    return {
      message: "אימייל או סיסמה שגויים",
      values: { email },
    };
  }

  await createSession(user._id.toString());

  redirect("/");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
