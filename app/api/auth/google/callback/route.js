import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { exchangeCodeForGoogleUser } from "@/app/lib/google";
import { findOrCreateGoogleUser } from "@/app/lib/auth";
import { createSession } from "@/app/lib/session";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // המשתמש ביטל או ש-Google החזירה שגיאה
    if (error) {
      console.error("Google OAuth error:", error);

      return NextResponse.redirect(
        new URL("/login?error=google_cancelled", request.url),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/login?error=google_invalid", request.url),
      );
    }

    // בדיקת state נגד ה-cookie שיצרנו לפני המעבר ל-Google
    const cookieStore = await cookies();
    const savedState = cookieStore.get("google_oauth_state")?.value;

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        new URL("/login?error=google_state", request.url),
      );
    }

    // ה-state הוא חד פעמי
    cookieStore.delete("google_oauth_state");

    // החלפת ה-code בפרטי המשתמש
    const googleUser = await exchangeCodeForGoogleUser(code);

    if (
      !googleUser?.sub ||
      !googleUser?.email ||
      googleUser.email_verified !== true
    ) {
      return NextResponse.redirect(
        new URL("/login?error=google_profile", request.url),
      );
    }

    // מציאת משתמש קיים או יצירת משתמש חדש
    const user = await findOrCreateGoogleUser({
      googleId: googleUser.sub,
      name: googleUser.name || "",
      email: googleUser.email,
      picture: googleUser.picture || "",
    });

    // יצירת ה-JWT הרגיל של CourseAI
    await createSession(user._id.toString());

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Google callback error:", error);

    return NextResponse.redirect(
      new URL("/login?error=google_failed", request.url),
    );
  }
}
