import { createHash } from "node:crypto";
import connectDB from "@/app/lib/db";
import DiscoveredCourse from "@/app/models/DiscoveredCourse";

export async function cacheDiscoveredCourses(results, category) {
  if (!results.length) return [];
  await connectDB();
  const courses = results.map((result) => {
    const detailsId = createHash("sha256").update(`${category}\n${result.url}`).digest("hex");
    return { ...result, detailsId };
  });
  await DiscoveredCourse.bulkWrite(courses.map((result) => ({
    updateOne: {
      filter: { _id: result.detailsId },
      update: { $set: {
        title: result.title,
        description: result.description,
        provider: result.provider || new URL(result.url).hostname.replace(/^www\./, ""),
        category,
        url: result.url,
      }, $setOnInsert: { content: "" } },
      upsert: true,
    },
  })));
  return courses;
}
