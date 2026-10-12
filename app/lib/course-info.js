import { cleanCourseSnippet } from "@/app/lib/course-content";

function splitSentences(text = "") {
  return cleanCourseSnippet(text)
    .split(/(?<=[.!?])\s+|\s+(?=(?:תנאי קבלה|תוכנית לימודים|תכנית לימודים|משך|היקף|למשתתפים|לבוגרים))/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(items) {
  return [...new Set(items)].slice(0, 4);
}

// Google Search Results Scraper returns a title + snippet, not the full course page.
// We only classify facts explicitly present in that snippet. Missing data stays missing.
export function courseInfoFromSearchSnippet(course) {
  const description = cleanCourseSnippet(course.description || "");
  const sentences = splitSentences(description);

  const duration = [];
  const admission = [];
  const curriculum = [];
  const certification = [];
  const price = [];

  for (const sentence of sentences) {
    if (/(?:\d+(?:[.,]\d+)?\s*(?:שעות|חודשים|שנים|מפגשים)|ארבעה חודשי|חצי שנה|שנה וחצי|שנתיים|פעמיים בשבוע|פעם בשבוע|מתכונת (?:היברידית|מקוונת|בוקר|ערב))/i.test(sentence)) duration.push(sentence);
    if (/(?:תנאי קבלה|דרישות קבלה|נדרש|נדרשת|בגרות|ראיון|ריאיון|ניסיון קודם|ידע קודם)/i.test(sentence)) admission.push(sentence);
    if (/(?:תוכנית לימודים|תכנית לימודים|נושאי לימוד|סילבוס|מקנים ידע|דיני |מס הכנסה|ביטוח לאומי|תוכנות |טכניקות |לומדים)/i.test(sentence)) curriculum.push(sentence);
    if (/(?:תוענק תעודה|תעודה מטעם|תעודת (?:גמר|סיום|הסמכה)|הסמכת|הכנה לבחינות|מכינים לבחינות)/i.test(sentence)) certification.push(sentence);
    if (/(?:₪|ש[״"]ח|שקל|מחיר|עלות|שכר לימוד)/i.test(sentence)) price.push(sentence);
  }

  return {
    overview: description ? [description] : [],
    admission: unique(admission),
    curriculum: unique(curriculum),
    duration: unique(duration),
    certification: unique(certification),
    price: unique(price),
    institutions: course.provider ? [course.provider] : [],
    relevant: true,
  };
}
