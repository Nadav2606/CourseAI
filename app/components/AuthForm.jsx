"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction } from "@/actions/auth";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";

  const initial = isRegister
    ? { errors: {}, values: {}, message: "" }
    : { errors: {}, message: "", values: {} };

  const [state, action, pending] = useActionState(
    isRegister ? registerAction : loginAction,
    initial,
  );

  return (
    <div className="card form">
      <div>
        <h1>{isRegister ? "יצירת חשבון" : "ברוכים הבאים"}</h1>

        <p>
          {isRegister
            ? "צרו חשבון והתחילו למצוא קורסים שמתאימים לכם."
            : "התחברו לחשבון שלכם והמשיכו לגלות קורסים."}
        </p>
      </div>

      {/* Google */}
      <a href="/api/auth/google" className="googleButton">
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.35 12.2c0-.64-.06-1.25-.17-1.84H12v3.48h5.25a4.49 4.49 0 0 1-1.95 2.94v2.44h3.16c1.85-1.7 2.89-4.21 2.89-7.02Z"
          />
          <path
            fill="#34A853"
            d="M12 21.5c2.64 0 4.86-.87 6.48-2.37l-3.16-2.44c-.88.59-2 .94-3.32.94-2.55 0-4.71-1.72-5.48-4.04H3.26v2.51A9.79 9.79 0 0 0 12 21.5Z"
          />
          <path
            fill="#FBBC05"
            d="M6.52 13.59A5.9 5.9 0 0 1 6.2 11.7c0-.66.11-1.3.32-1.89V7.3H3.26A9.79 9.79 0 0 0 2.2 11.7c0 1.58.38 3.08 1.06 4.4l3.26-2.51Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.77c1.44 0 2.73.49 3.74 1.46l2.81-2.81C16.85 2.84 14.64 1.9 12 1.9A9.79 9.79 0 0 0 3.26 7.3l3.26 2.51C7.29 7.49 9.45 5.77 12 5.77Z"
          />
        </svg>

        <span>
          {isRegister ? "הרשמה באמצעות Google" : "המשך באמצעות Google"}
        </span>
      </a>

      <div className="authDivider">
        <span>או</span>
      </div>

      {/* Email / Password */}
      <form action={action} className="authFields">
        {isRegister && (
          <label>
            שם
            <input
              name="name"
              placeholder="השם שלך"
              defaultValue={state.values?.name || ""}
              disabled={pending}
            />
            {state.errors?.name && (
              <span className="error">{state.errors.name}</span>
            )}
          </label>
        )}

        <label>
          אימייל
          <input
            type="email"
            name="email"
            placeholder="name@example.com"
            autoComplete="email"
            defaultValue={state.values?.email || ""}
            disabled={pending}
          />
          {state.errors?.email && (
            <span className="error">{state.errors.email}</span>
          )}
        </label>

        <label>
          סיסמה
          <input
            type="password"
            name="password"
            placeholder="הסיסמה שלך"
            autoComplete={isRegister ? "new-password" : "current-password"}
            disabled={pending}
          />
          {state.errors?.password && (
            <span className="error">{state.errors.password}</span>
          )}
        </label>

        {state.message && <p className="error">{state.message}</p>}

        <button className="button" disabled={pending}>
          {pending
            ? isRegister
              ? "יוצר חשבון..."
              : "מתחבר..."
            : isRegister
              ? "יצירת חשבון"
              : "התחברות"}
        </button>
      </form>

      <p className="authSwitch">
        {isRegister ? (
          <>
            כבר יש לך חשבון? <Link href="/login">התחברות</Link>
          </>
        ) : (
          <>
            עדיין אין לך חשבון? <Link href="/register">יצירת חשבון</Link>
          </>
        )}
      </p>
    </div>
  );
}
