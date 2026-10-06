import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { fetchCourses } from "@/app/lib/apify";
import { getSessionUser } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Course from "@/app/models/Course";
import DiscoverSearchForm from "@/app/components/DiscoverSearchForm";
import PopularCategories from "@/app/components/PopularCategories";
import SaveCourseButton from "@/app/components/SaveCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const popularCategories = [
  {
    icon: "💻",
    title: "Full Stack",
    description: "פיתוח אתרים ואפליקציות עם JavaScript, React ו-Node.js.",
    query: "Full Stack",
  },
  {
    icon: "💰",
    title: "חשב שכר",
    description: "הכשרה מקצועית בתחום השכר, דיני עבודה ומיסוי.",
    query: "חשב שכר",
  },
  {
    icon: "🍰",
    title: "קונדיטוריה",
    description: "אפייה מקצועית, קינוחים, שוקולד וטכניקות קונדיטוריה.",
    query: "קונדיטוריה",
  },
  {
    icon: "📈",
    title: "שיווק דיגיטלי",
    description: "פרסום ברשת, רשתות חברתיות, SEO וניהול קמפיינים.",
    query: "שיווק דיגיטלי",
  },
  {
    icon: "🌍",
    title: "אנגלית",
    description: "אנגלית מדוברת, עסקית ומקצועית לכל הרמות.",
    query: "אנגלית",
  },
  {
    icon: "🏠",
    title: "עיצוב פנים",
    description: "עיצוב ותכנון חללים, תוכנות מקצועיות ועבודה מעשית.",
    query: "עיצוב פנים",
  },
];

function cleanDescription(text = "") {
  return String(text)
    .replace(/Read more\.{0,3}/gi, "")
    .replace(/קרא עוד\.{0,3}/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}
function siteName(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "אתר הקורס";
  }
}

export default async function Discover({ searchParams }) {
  const params = await searchParams;
  const q = String(params?.q || "").trim();
  const user = await getSessionUser();
  let results = [],
    error = "",
    savedUrls = new Set();

  if (q) {
    try {
      results = await fetchCourses({ query: q });
    } catch (err) {
      console.error("Course search error:", err);
      error = "לא הצלחנו להשלים את החיפוש כרגע. נסה שוב בעוד כמה רגעים.";
    }
  }
  if (user && results.length) {
    await connectDB();
    const urls = results.map((r) => r.url).filter(Boolean);
    const saved = await Course.find({
      userId: user.id,
      sourceUrl: { $in: urls },
    })
      .select("sourceUrl")
      .lean();
    savedUrls = new Set(saved.map((c) => c.sourceUrl));
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50/70">
      <section className="discover-hero border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8">
          <Badge variant="secondary" className="mb-5 rounded-full px-4 py-1.5">
            למצוא. להשוות. לבחור.
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            הקורס הבא שלך מתחיל כאן
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            חפש את התחום שמעניין אותך, גלה אפשרויות לימוד ושמור את הקורסים שתרצה
            לבדוק לעומק.
          </p>
          <DiscoverSearchForm initialQuery={q} />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 shadow-none">
            <CardContent className="py-5 text-center text-sm text-red-700">
              {error}
            </CardContent>
          </Card>
        )}
        {!q && (
          <section>
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-950">
                תחומים פופולריים
              </h2>
              <p className="mt-2 text-slate-500">
                לא בטוח מאיפה להתחיל? בחר תחום שמעניין אותך ונציג אפשרויות
                מתאימות.
              </p>
            </div>
            <Separator className="mb-8" />
            <PopularCategories categories={popularCategories} />
          </section>
        )}

        {q && !error && results.length > 0 && (
          <section>
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-medium text-violet-700">
                  תוצאות עבורך
                </p>
                <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
                  קורסים בנושא &quot;{q}&quot;
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  מצאנו {results.length} אפשרויות שכדאי להכיר
                </p>
              </div>
              <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                {results.length} תוצאות
              </Badge>
            </div>
            <Separator className="mb-8" />
            <div className="course-results-grid">
              {results.map((result) => {
                const description = cleanDescription(result.description);
                const provider = siteName(result.url);
                return (
                  <Card
                    key={`${result.id}-${result.url}`}
                    className="result-card course-result-card"
                  >
                    <CardHeader className="course-result-header">
                      <div className="course-result-meta">
                        <Badge variant="secondary" className="course-provider">
                          {provider}
                        </Badge>
                        <span className="course-topic">{q}</span>
                      </div>
                      <CardTitle className="course-result-title">
                        {result.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="course-result-content">
                      {description ? (
                        <details className="course-description">
                          <summary>
                            <span className="show-more">הצג עוד</span>
                            <span className="show-less">הצג פחות</span>
                          </summary>
                          <p className="course-description-preview">
                            {description}
                          </p>
                          <p className="course-description-full">
                            {description}
                          </p>
                        </details>
                      ) : (
                        <p className="course-empty-description">
                          פרטים נוספים על הקורס זמינים בעמוד הקורס.
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="course-result-footer">
                      <SaveCourseButton
                        loggedIn={Boolean(user)}
                        initiallySaved={savedUrls.has(result.url)}
                        course={{
                          title: result.title,
                          provider,
                          category: q,
                          url: result.url,
                        }}
                      />
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button className="h-11 w-full course-details-button">
                          לפרטים <ExternalLink />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {q && !error && results.length === 0 && (
          <Card className="mx-auto max-w-xl text-center shadow-sm">
            <CardHeader>
              <div className="mx-auto mb-2 text-4xl">🔎</div>
              <CardTitle>לא מצאנו התאמה הפעם</CardTitle>
              <CardDescription className="leading-6">
                נסה לחפש בשם מקצוע, תחום לימודים או מיומנות שתרצה לרכוש.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Link href="/discover">
                <Button variant="outline">חזרה לחיפוש</Button>
              </Link>
            </CardFooter>
          </Card>
        )}
      </div>
    </main>
  );
}
