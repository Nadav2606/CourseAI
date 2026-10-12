export function isEnglishLearningQuery(query = "") {
  return /אנגלית|\benglish\b/i.test(query) && !/תואר|בשפה האנגלית|לימודים באנגלית|באנגלית בישראל|לימודים בשפה/.test(query);
}

export function buildCourseSearchQuery(query) {
  if (isEnglishLearningQuery(query)) {
    return `קורס ללימוד השפה האנגלית ${query} בישראל -\"תואר באנגלית\" -\"לימודים בשפה האנגלית\" -\"לימודים באנגלית\"`;
  }
  // Encourage Google to return actual study/course pages rather than exam/news pages.
  return `קורס ${query} לימודים מכללה הכשרה בישראל`;
}

export function isLikelyCourseResult(category = "", title = "", description = "", url = "") {
  const text = `${title} ${description}`;
  const normalizedTitle = String(title).trim();

  // These are usually exam pages, regulations, articles or files rather than a course page.
  if (/\.(?:pdf|docx?|xlsx?)(?:$|[?#])/i.test(url)) return false;
  if (/^(?:בחינת?|מבחן|תקנון|מאגר בחינות|מידע על מועדי בחינות|כללים? ל|נוהל )/i.test(normalizedTitle)) return false;

  const hasCourseSignal = /קורס|לימוד|הכשר|תכנית לימודים|תוכנית לימודים|מסלול|מכלל|אקדמ|אוניברסיט/i.test(text);
  const topicWords = String(category).split(/\s+/).filter((word) => word.length > 1);
  const hasTopic = topicWords.length === 0 || topicWords.some((word) => text.toLowerCase().includes(word.toLowerCase()));
  return hasCourseSignal && hasTopic;
}

export function isCourseIntentMismatch(category = "", title = "", description = "") {
  if (!isEnglishLearningQuery(category)) return false;
  const text = `${title} ${description}`;
  const taughtInEnglish = /לימודים בשפה האנגלית|לימודים באנגלית|ללמוד באנגלית בישראל|תכניות לימודים אקדמיות הנלמדות בשפה האנגלית|תואר (?:ראשון|שני|שלישי|בשפה|באנגלית)|תוכניות? (?:אקדמיות|בינלאומיות)|מדעי החברה|בתי הספר הבינלאומיים/.test(text);
  const languageTraining = /אנגלית (?:מדוברת|עסקית|למתחילים|למתקדמים)|לימוד(?:י)? (?:השפה )?אנגלית|לימוד השפה האנגלית|שיפור (?:האנגלית|רמת האנגלית)|English (?:course|lessons|language|speaking)/i.test(text);
  return taughtInEnglish && !languageTraining;
}
