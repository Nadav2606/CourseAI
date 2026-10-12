// Render scraped text as React text nodes; never execute source HTML.
export function cleanCourseText(text = "") {
  return String(text)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/&#x20;|&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/[*`\\]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function courseContentBlocks(content = "") {
  const blocks = [];
  let paragraph = [];
  const flush = () => {
    const text = cleanCourseText(paragraph.join(" "));
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };
  for (const line of String(content).split(/\r?\n/)) {
    if (!line.trim()) { flush(); continue; }
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+)$/);
    const bullet = line.match(/^\s*(?:[-*+] |\d+[.)] )(.+)$/);
    if (heading || bullet) {
      flush();
      const text = cleanCourseText((heading || bullet)[1]);
      if (text) blocks.push({ type: heading ? "heading" : "bullet", text });
    } else {
      paragraph.push(line);
    }
  }
  flush();
  // Some sources return a single flat paragraph: split at sentence boundaries.
  return blocks.flatMap((block) => {
    if (block.type !== "paragraph" || block.text.length < 700) return [block];
    const sentences = block.text.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) || [block.text];
    const parts = [];
    let text = "";
    for (const sentence of sentences) {
      if (text.length > 450) { parts.push({ type: "paragraph", text: text.trim() }); text = ""; }
      text += sentence;
    }
    if (text.trim()) parts.push({ type: "paragraph", text: text.trim() });
    return parts;
  });
}

const COURSE_SECTIONS = [
  { title: "על הקורס", pattern: /על הקורס|אודות הקורס|מטרת הקורס|מטרות הקורס|תיאור הקורס|מהו הקורס/ },
  { title: "למי הקורס מתאים", pattern: /קהל יעד|למי .*מתאים|מיועד ל|מתאים ל/ },
  { title: "תנאי קבלה", pattern: /תנאי קבלה|דרישות קבלה|כדי להתקבל|שנות לימוד|תעודת בגרות|ראיון אישי/ },
  { title: "מה לומדים", pattern: /תכנית הלימוד|תוכנית הלימוד|נושאי לימוד|סילבוס|תכני הקורס|נושאי הקורס/ },
  { title: "משך ומתכונת הלימודים", pattern: /היקף הקורס|משך .*לימוד|משך הקורס|מתכונת|שעות (?:לימוד|הוראה|אקדמיות)|מפגשים|אונליין|סטאז|התנסות מעשית/ },
  { title: "תעודה והסמכה", pattern: /תעודת (?:גמר|סיום|מקצוע)|תעודה והסמכה|תעודות|הסמכה|בחינת הסמכה|תעודת סיווג/ },
  { title: "עלות ומיקום", pattern: /עלות הקורס|שכר לימוד|מחיר הקורס|מיקום הקורס|מקום הלימודים|מועדי הקורס|מועדי פתיחה/ },
];
const NOISE = /שירות אישי חינם|השאירו פרטים|השארת פרטים|אני מסכים|מדיניות פרטיות|תנאי השימוש|קוקי|עוגיות|פופאפ|שלח עכשיו|התקשרו עכשיו|נציגי השירות|יחזרו אליך|ללא התחייבות|בתודה ל|זכויות שמורות|עקבו אחרינו|צפיות|מנהל הפורום|חוו[״"']ד|דף הבית|קראו על|רוצים ללמוד בדרום|רוצה פרטים|צריך פרטים|רוצה לדעת יותר|רוצה שמוסדות|לא להעביר את פרטיך|הצהרת נגישות|תפריט נגישות|סרגל נגישות|התאמה לעוורי צבעים|עיוורי צבעים|כבדי ראייה|קורא מסך|ניווט מקלדת|קיצורי מקלדת|מקלדת קיצור דרך|הגדלת טקסט|הקטנת טקסט|גודל גופן|ניגודיות|גווני אפור|שחור לבן|הדגשת קישורים|עצירת אנימציות|איפוס הגדרות|דלג לתוכן|מעבר לתוכן|פתח תפריט|סגור תפריט|חיפוש באתר|אודותינו|צור קשר|צרו קשר/i;

const CHROME_ONLY = /^(?:ראשי|בית|אודות|אודותינו|צור קשר|צרו קשר|חיפוש|תפריט|כניסה|הרשמה|התחברות|הצהרת נגישות)$/i;

export function isCourseNoise(text = "") {
  const value = cleanCourseText(text).replace(/\s+/g, " ").trim();
  return !value || NOISE.test(value) || CHROME_ONLY.test(value);
}

export function cleanCourseSnippet(text = "") {
  const value = cleanCourseText(text)
    .replace(/Read more\.{0,3}/gi, "")
    .replace(/קרא עוד\.{0,3}/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (isCourseNoise(value)) return "";
  return value.length > 360 ? `${value.slice(0, 357).trim()}...` : value;
}
const EXCLUDED_SECTION = /^(?:מוסדות לימוד|מספר דוגמאות למוסדות|עוד מוסדות|עוד מסלולים|כל המסלולים|שאלות הגולשים|תגובות הגולשים|שאלות ותשובות|צרו קשר|צור קשר|שירות אישי|פופאפ|תלמידים ממליצים)/;

// Extract short, source-based sections. No generated facts or forum answers.
export function relevantCourseBlocks(content = "", { category = "", title = "" } = {}) {
  const buckets = COURSE_SECTIONS.map(() => []);
  const seen = new Set();
  let current = 0;
  let skip = false;
  let forum = false;
  let totalLength = 0;
  for (const rawLine of String(content).split(/\r?\n/)) {
    const line = cleanCourseText(rawLine.replace(/^\s*#{1,6}\s*/, "").replace(/^\s*[-+]\s+/, ""));
    if (!line || /^[\[\]()|\s-]+$/.test(line)) continue;
    if (/^(?:שאלות הגולשים|תגובות הגולשים|פורום)/.test(line)) { forum = true; continue; }
    if (forum) continue;
    if (EXCLUDED_SECTION.test(line)) { skip = true; continue; }
    const section = COURSE_SECTIONS.findIndex((item) => item.pattern.test(line));
    const heading = line.length < 100 && (rawLine.trim().startsWith("#") || !/[.!?]/.test(line));
    if (heading && section >= 0 && !isCourseNoise(line)) {
      current = section;
      skip = false;
      // Keep actual facts such as "היקף הקורס: 400 שעות", not just labels.
      if (!/\d/.test(line)) continue;
    }
    if (skip || isCourseNoise(line)) continue;
    const sentences = line.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g) || [line];
    for (let sentence of sentences) {
      sentence = sentence.trim();
      if (sentence.length < 25 || isCourseNoise(sentence)) continue;
      // Ignore cross-links and directories, even when they name the searched topic.
      if (/מכלל[הת].*[:：]|למידע נוסף|לחצו כאן|לרשימת|עוד קורסים|מסלולים נוספים|בברכה|שלום [^ ]+[,!]/.test(sentence)) continue;
      const index = COURSE_SECTIONS.findIndex((item) => item.pattern.test(sentence));
      const target = index >= 0 ? index : current;
      const topic = category || title;
      if (index < 0 && current === 0 && topic && !sentence.includes(topic) && !/הקורס|הלימודים|המסלול|התלמידים|המשתתפים/.test(sentence)) continue;
      if (sentence.length > 450) continue;
      const key = sentence.replace(/\s+/g, " ").toLowerCase();
      if (totalLength + sentence.length > 2400 || seen.has(key) || buckets[target].length >= 2 || buckets[target].join(" ").length + sentence.length > 650) continue;
      seen.add(key);
      buckets[target].push(sentence);
      totalLength += sentence.length;
    }
  }
  return COURSE_SECTIONS.flatMap((section, index) => buckets[index].length ? [
    { type: "heading", text: section.title },
    ...buckets[index].map((text) => ({ type: "bullet", text })),
  ] : []);
}

const FOCUSED_HEADINGS = [
  { key: "price", pattern: /^(?:מחיר|עלות|שכר לימוד|תשלום)(?:\s|$)/ },
  { key: "institutions", pattern: /^(?:מוסדות לימוד|מכללות|איפה לומדים|היכן לומדים|מוסדות שמציעים|מספר דוגמאות למוסדות)(?:\s|$)/ },
  { key: "overview", pattern: /^(?:על הקורס|אודות|מטרות?|תיאור|רקע|מידע כללי)(?:\s|$)/ },
  { key: "admission", pattern: /^(?:תנאי קבלה|דרישות קבלה|דרישות סף|קבלה ללימודים)(?:\s|$)/ },
  { key: "curriculum", pattern: /^(?:מה לומדים|נושאי|תכני|תכנית|תוכנית|סילבוס)(?:\s|$)/ },
  { key: "certification", pattern: /^(?:תעודות?|תעודת|הסמכה|בחינות|בחינת|מבחנים|מבחני|תנאי זכאות|דרישות סיום|זכאות לתעודה)(?:\s|$)/ },
  { key: "duration", pattern: /^(?:משך|היקף|מתכונת|זמני|ימי|שעות|מועדי)(?:\s|$)/ },
];
const ADMISSION_FACT = /(?:\d+\s*שנות לימוד|בגרות|ראיון|ריאיון|נדרש|נדרשת|נדרשים|חובה|דרוש|ידיעת|שליטה|תעודה|תעודת|מבחן קבלה|בחינת קבלה|ידע (?:קודם|בסיסי)|ניסיון (?:קודם|מקצועי)|תעודת (?:גמר|הסמכה)|בוגרי|בעלי תואר|תואר (?:ראשון|שני)|מועמדים|ללא תנאי|אין תנאי)/;

export function normalizeSourceText(content) {
  return cleanCourseText(content).replace(/\s+/g, " ").trim();
}

export function durationInMonths(quotes = []) {
  const text = quotes.join(" ");
  const explicit = text.match(/(?:כ[-־\s]*)?(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?\s*חודשים?/);
  if (explicit) return explicit[0].trim();
  if (/שנה וחצי/.test(text)) return "18 חודשים (שנה וחצי)";
  if (/חצי שנה/.test(text)) return "6 חודשים (חצי שנה)";
  const years = text.match(/(\d+(?:[.,]\d+)?)\s*שנים/);
  if (years) return `${Number(years[1].replace(",", ".")) * 12} חודשים (${years[0]})`;
  if (/שנתיים/.test(text)) return "24 חודשים (שנתיים)";
  if (/(?:^|\s)(?:כ[-־]?)?שנה(?: אחת)?(?:[\s.,]|$)/.test(text)) return "12 חודשים (שנה)";
  return "לא צוין במקור משך בחודשים";
}

// Deterministic fallback: section headings set context; keywords inside a topic
// such as "חישוב חודשי" must never turn curriculum text into admission/duration.
const MARKETING_OR_NAV = /(?:רוצים? ללמוד|רוצה ללמוד|ללמוד .*מעניין|קרוב לבית|קראו עוד|קרא עוד|לחצו כאן|למידע נוסף|היכן לומדים\??$|איפה לומדים\??$|השאירו פרטים|לקבלת פרטים|ייעוץ לימודים|יועצי לימודים|הרשמו|הרשמה עכשיו|קורסים? (?:בצפון|בדרום|במרכז|בירושלים|בתל.?אביב)|מסלולים נוספים|עוד קורסים)/i;
const CERTIFICATION_FACT = /(?:תעודת (?:גמר|סיום|מקצוע|הסמכה)|תעודה מטעם|תעודה המוכרת|זכאות לתעודה|יקבלו? תעודה|מקבלים? תעודה|הסמכה מקצועית|בחינ(?:ת|ות) (?:גמר|הסמכה|חיצוניות|מועצה)|מבחנ(?:י|י ה)? (?:גמר|הסמכה|חיצוניים)|רישיון מקצועי|תעודת חשב|לשכת רואי החשבון|משרד העבודה|משרד החינוך)/i;
const DURATION_FACT = /(?:\d+(?:[.,]\d+)?\s*(?:שעות|שעות אקדמיות|חודשים|שנים|ימים|מפגשים)|שנה וחצי|חצי שנה|שנתיים|פעם בשבוע|פעמיים בשבוע|לימודי (?:בוקר|ערב)|מתכונת (?:בוקר|ערב|היברידית|מקוונת)|אונליין|פרונטלי)/i;
const CURRICULUM_NOISE = /(?:תנאי קבלה|תעודה|הסמכה|שכר לימוד|מחיר|עלות)/i;

function splitSourceSentences(line) {
  return line.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map((part) => part.trim()).filter(Boolean) || [line];
}

function validFocusedFact(key, text) {
  if (!text || isCourseNoise(text) || MARKETING_OR_NAV.test(text)) return false;
  if (/^קורס .+ (?:בצפון|בדרום|במרכז|בירושלים|בתל.?אביב|בחיפה|בבאר שבע|באזור .+)$/i.test(text)) return false;
  if (/^[?!.,:;\-–—\s]+$/.test(text)) return false;
  if (key === "price") return /(?:₪|ש[״"]ח|שקל|ILS|NIS|\$|דולר|חינם)/i.test(text);
  if (key === "admission") return ADMISSION_FACT.test(text) && !MARKETING_OR_NAV.test(text);
  if (key === "certification") return text.length >= 20;
  if (key === "duration") return DURATION_FACT.test(text);
  if (key === "curriculum") return text.length >= 20 && !CURRICULUM_NOISE.test(text);
  if (key === "institutions") return text.length >= 2 && text.length <= 220 && !/[?]/.test(text);
  if (key === "overview") return text.length >= 70;
  return true;
}

// Deterministic parser: only an actual source heading/label changes category.
// Words such as "תעודה" inside a paragraph never move unrelated text to another bucket.
export function focusedCourseInfo(content = "") {
  const info = { overview: [], admission: [], curriculum: [], duration: [], certification: [], price: [], institutions: [] };
  let current = "overview";
  let skip = false;
  const seen = new Set();

  for (const raw of String(content).split(/\r?\n/)) {
    const hadMarkdownHeading = /^\s*#{1,6}\s/.test(raw);
    const line = cleanCourseText(raw.replace(/^\s*#{1,6}\s*/, "").replace(/^\s*[-+]\s+/, ""));
    if (!line) continue;
    if (/^(?:שאלות הגולשים|תגובות הגולשים|פורום)/.test(line)) break;

    const section = FOCUSED_HEADINGS.find((entry) => entry.pattern.test(line));
    const labelHeading = Boolean(section && line.length < 100 && !/[.!?]/.test(line));
    if (section && (hadMarkdownHeading || labelHeading)) {
      current = section.key;
      skip = false;
      // A heading with a colon can also contain a real value, e.g. "משך: 120 שעות".
      if (!line.includes(":")) continue;
    } else if (hadMarkdownHeading) {
      // The first H1 is usually the course title, not a content section.
      const noFactsYet = Object.values(info).every((items) => items.length === 0);
      if (current === "overview" && noFactsYet) { skip = false; continue; }
      current = null;
      skip = true;
      continue;
    } else if (EXCLUDED_SECTION.test(line)) {
      current = null;
      skip = true;
      continue;
    }

    if (skip || !current || isCourseNoise(line) || /^[\[\]()|\s-]+$/.test(line)) continue;

    for (const sentence of splitSourceSentences(line)) {
      const text = sentence.replace(/\s+/g, " ").trim();
      if (!validFocusedFact(current, text)) continue;
      const maxItems = current === "institutions" ? 8 : current === "curriculum" ? 6 : current === "overview" ? 3 : 4;
      const key = text.toLowerCase();
      if (seen.has(key) || info[current].length >= maxItems || text.length > 700) continue;
      seen.add(key);
      info[current].push(text);
    }
  }

  info.overview = info.overview.filter((line, index) => index === 0 || info.overview.slice(0, index).join(" ").length < 500);
  return info;
}

// Only retain exact source quotations; absent facts remain absent.
export function validateCourseInfo(candidate, source) {
  const normalized = normalizeSourceText(source);
  const info = { overview: [], admission: [], curriculum: [], duration: [], certification: [], price: [], institutions: [] };
  for (const key of Object.keys(info)) {
    if (!Array.isArray(candidate?.[key])) continue;
    const limit = key === "institutions" ? 8 : key === "curriculum" ? 6 : key === "overview" ? 3 : 4;
    for (const quote of candidate[key]) {
      if (typeof quote !== "string") continue;
      const text = normalizeSourceText(quote);
      if (!text || text.length > 1200 || !normalized.includes(text) || !validFocusedFact(key, text)) continue;
      if (!info[key].includes(text)) info[key].push(text);
      if (info[key].length >= limit) break;
    }
  }
  return info;
}
