import { Agent, run } from "@openai/agents";

const MAX_CONTENT_LENGTH = 30000;

const courseExtractor = new Agent({
  name: "Course Data Extractor",

  instructions: `
You extract course information from website content.

You will receive content scraped from a website in Israel.

Your job is to identify real courses or study programs that are explicitly
mentioned in the provided content.

For every course found, extract:

- courseName
- institution
- price
- city
- region
- studyHours
- meetings
- description
- logo

STRICT RULES:

1. Use ONLY information explicitly present in the provided website content.
2. Never invent missing information.
3. If a field is not available, return null.
4. Do not guess prices, locations, institutions, study hours or course names.
5. Different study tracks should be returned as separate courses.
6. Ignore unrelated content.
7. Do not create duplicate courses.
8. Return ONLY valid JSON.
9. Do not include markdown or explanations.

Return this exact structure:

{
  "courses": [
    {
      "courseName": null,
      "institution": null,
      "price": null,
      "city": null,
      "region": null,
      "studyHours": null,
      "meetings": null,
      "description": null,
      "logo": null
    }
  ]
}

If no real courses are found, return:

{
  "courses": []
}
`,

  model: "gpt-5.6-luna",
});

export async function extractCoursesFromResult(result) {
  // מקבלים את תוכן האתר מ-Apify
  const rawContent =
    result.websiteContent?.text || result.websiteContent?.markdown || "";

  if (!rawContent.trim()) {
    return [];
  }

  // מגבילים את כמות הטקסט שנשלחת ל-OpenAI
  // כדי לשפר מהירות ולהקטין שימוש בטוקנים
  const content = rawContent.slice(0, MAX_CONTENT_LENGTH);

  const input = `
SOURCE URL:
${result.url}

SEARCH RESULT TITLE:
${result.title}

WEBSITE CONTENT:
${content}
`;

  try {
    const response = await run(courseExtractor, input);

    const output = response.finalOutput;

    if (!output) {
      return [];
    }

    const parsed = JSON.parse(output);

    if (!Array.isArray(parsed.courses)) {
      return [];
    }

    return parsed.courses.map((course, index) => ({
      id: `${result.id}-${index}`,

      courseName: course.courseName || null,

      institution: course.institution || null,

      price: course.price || null,

      city: course.city || null,

      region: course.region || null,

      studyHours: course.studyHours || null,

      meetings: course.meetings || null,

      description: course.description || null,

      logo: course.logo || null,

      // הקישור מגיע ישירות מתוצאת Apify
      url: result.url,

      // מקור האתר
      source: result.source || null,
    }));
  } catch (error) {
    console.error(`Failed to extract courses from ${result.url}:`, error);

    return [];
  }
}

export async function extractCoursesFromResults(results, limit = 25) {
  if (!Array.isArray(results) || results.length === 0) {
    return [];
  }

  // במקום לחכות לכל אתר בנפרד,
  // שולחים את האתרים ל-OpenAI במקביל
  const extractedResults = await Promise.all(
    results.map((result) => extractCoursesFromResult(result)),
  );

  const allCourses = [];

  // כל אתר יכול להכיל יותר מקורס אחד
  for (const courses of extractedResults) {
    for (const course of courses) {
      if (!course.courseName) {
        continue;
      }

      // בדיקה שהקורס לא כבר קיים
      const alreadyExists = allCourses.some((existingCourse) => {
        const sameName =
          existingCourse.courseName?.toLowerCase().trim() ===
          course.courseName?.toLowerCase().trim();

        const sameInstitution =
          existingCourse.institution?.toLowerCase().trim() ===
          course.institution?.toLowerCase().trim();

        return sameName && sameInstitution;
      });

      if (!alreadyExists) {
        allCourses.push(course);
      }

      // אנחנו רוצים מקסימום 25 קורסים
      if (allCourses.length >= limit) {
        return allCourses;
      }
    }
  }

  return allCourses;
}
