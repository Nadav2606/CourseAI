"use server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Course from "@/app/models/Course";

export async function addCourseAction(prevState, formData) {
  const user = await getSessionUser();
  if (!user) return { error: "יש להתחבר תחילה", success: "" };

  const title = String(formData.get("title") || "").trim();
  const provider = String(formData.get("provider") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  if (title.length < 2) return { error: "נא להזין שם קורס", success: "" };

  await connectDB();
  await Course.create({ userId: user.id, title, provider, category, notes });
  revalidatePath("/courses");
  return { error: "", success: "הקורס נשמר ברשימה שלך" };
}

export async function deleteCourseAction(formData) {
  const user = await getSessionUser();
  if (!user) return;
  const id = String(formData.get("id") || "");
  await connectDB();
  await Course.deleteOne({ _id: id, userId: user.id });
  revalidatePath("/courses");
}

export async function saveDiscoveredCourseAction(prevState, formData) {
  const user = await getSessionUser();
  if (!user) return { saved: false, error: "יש להתחבר כדי לשמור קורסים" };

  const title = String(formData.get("title") || "").trim();
  const provider = String(formData.get("provider") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const sourceUrl = String(formData.get("sourceUrl") || "").trim();
  if (title.length < 2) return { saved: false, error: "לא ניתן לשמור את הקורס" };

  await connectDB();
  const existing = await Course.findOne({ userId: user.id, ...(sourceUrl ? { sourceUrl } : { title }) });
  if (!existing) await Course.create({ userId: user.id, title, provider, category, sourceUrl });

  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/discover");
  return { saved: true, error: "" };
}
