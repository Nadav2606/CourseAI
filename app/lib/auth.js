import bcrypt from "bcryptjs";
import connectDB from "./db";
import User from "../models/User";
import { getSessionUserId } from "./session";

export async function createUserWithPassword({ name, email, password }) {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();

  if (await User.findOne({ email: normalizedEmail })) {
    throw new Error("EMAIL_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });
}

export async function authenticateUser(email, password) {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordHash");

  if (!user) {
    return null;
  }

  // משתמש שנרשם רק דרך Google עדיין לא מחזיק סיסמה מקומית
  if (!user.passwordHash) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  return passwordMatches ? user : null;
}

export async function findOrCreateGoogleUser({
  googleId,
  name,
  email,
  picture,
}) {
  await connectDB();

  const normalizedEmail = email.trim().toLowerCase();

  // קודם מחפשים משתמש שכבר מחובר ל-Google
  let user = await User.findOne({ googleId });

  if (user) {
    // נעדכן את התמונה אם Google החזירה תמונה חדשה
    if (picture && user.profileImage !== picture) {
      user.profileImage = picture;
      await user.save();
    }

    return user;
  }

  // ייתכן שהמשתמש כבר נרשם בעבר עם אותו אימייל וסיסמה
  user = await User.findOne({
    email: normalizedEmail,
  });

  if (user) {
    user.googleId = googleId;

    if (picture) {
      user.profileImage = picture;
    }

    await user.save();

    return user;
  }

  // משתמש חדש לחלוטין
  return User.create({
    name: name?.trim() || normalizedEmail.split("@")[0],
    email: normalizedEmail,
    googleId,
    profileImage: picture || "",
  });
}

export async function getSessionUser() {
  const id = await getSessionUserId();

  if (!id) {
    return null;
  }

  await connectDB();

  const user = await User.findById(id).select(
    "name email profileImage googleId",
  );

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profileImage: user.profileImage || "",
    googleId: user.googleId || null,
  };
}
