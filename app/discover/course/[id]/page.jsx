import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, ExternalLink } from "lucide-react";
import connectDB from "@/app/lib/db";
import DiscoveredCourse from "@/app/models/DiscoveredCourse";
import { courseInfoFromSearchSnippet } from "@/app/lib/course-info";
import { getSessionUser } from "@/app/lib/auth";
import Course from "@/app/models/Course";
import SaveCourseButton from "@/app/components/SaveCourseButton";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function CourseDetails({ params }) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) notFound();
  await connectDB();
  let course = await DiscoveredCourse.findById(id).lean();
  if (!course) notFound();
  const user = await getSessionUser();
  const saved = user ? await Course.exists({ userId: user.id, sourceUrl: course.url }) : false;
  const info = courseInfoFromSearchSnippet(course);
  const sections = [
    { id: "admission", title: "תנאי קבלה", items: info.admission, empty: "תנאי הקבלה לא פורסמו בתוכן שהתקבל. יש לברר מול מוסד הלימודים." },
    { id: "curriculum", title: "מה לומדים", items: info.curriculum, empty: "לא התקבל פירוט של נושאי הלימוד. הסילבוס המלא עשוי להיות זמין באתר הקורס." },
    { id: "certification", title: "תעודות והסמכה", items: info.certification, empty: "לא פורסם בתוכן שהתקבל מידע על תעודות או בחינות הסמכה. יש לברר מול מוסד הלימודים." },
    { id: "duration", title: "משך ומתכונת הלימודים", items: info.duration, empty: "לא פורסמו פרטים על היקף ומתכונת הלימודים בתוכן שהתקבל." },
    ...(info.price.length ? [{ id: "price", title: "מחיר הקורס", items: info.price }] : []),
    { id: "institutions", title: "מכללות ומוסדות לימוד", items: info.institutions, empty: "לא התקבל פירוט על המכללות שמעבירות את הקורס. ניתן לבדוק באתר המקור." },
  ];
  const backUrl = `/discover?q=${encodeURIComponent(course.category || "")}`;

  return (
    <main className="course-detail-page" dir="rtl">
      <div className="course-detail-shell">
        <Link className="course-back-link" href={backUrl}><ArrowRight size={17} /> חזרה לתוצאות החיפוש</Link>
        <header className="course-detail-hero">
          <div className="result-course-icon"><BookOpen size={28} /></div>
          <div className="course-result-meta"><span className="course-topic">{course.category}</span><span className="course-provider" dir="auto">{course.provider}</span></div>
          <h1 dir="auto">{course.title}</h1>
          <p>הפרטים החשובים על המסלול, בצורה קצרה וברורה.</p>
        </header>
        <div className="course-detail-layout">
          <Card className="course-detail-article">
            <CardContent>
              <div className="course-detail-section-label">על הקורס</div>
              <h2>מה חשוב לדעת על הקורס</h2>
              <p className="course-overview-text">{info.overview.length ? info.overview.join(" ") : "לא התקבל הסבר ממוקד על הקורס. מידע נוסף זמין באתר מוסד הלימודים."}</p>
              {sections.map((section) => (
                <section key={section.id} aria-labelledby={`section-${section.id}`}>
                  <h3 id={`section-${section.id}`}>{section.title}</h3>
                  {section.items.length ? <ul className="course-detail-bullet">{section.items.map((text, index) => <li key={index}>{text}</li>)}</ul> : <p className="course-info-missing">{section.empty}</p>}
                </section>
              ))}
            </CardContent>
          </Card>
          <aside className="course-detail-sidebar">
            <Card className="course-detail-actions">
              <CardContent>
                <h2>הצעד הבא שלך</h2>
                <p>הקורס מעניין אותך? שמור אותו לבדיקה נוספת או עבור לאתר מוסד הלימודים.</p>
                <SaveCourseButton loggedIn={Boolean(user)} initiallySaved={Boolean(saved)} course={{ title: course.title, provider: course.provider, category: course.category, url: course.url }} />
                <a className="course-details-link" href={course.url} target="_blank" rel="noopener noreferrer">לאתר הקורס <ExternalLink size={17} /></a>
                <div className="course-source-note">העמוד מציג רק מידע שהופיע בתוצאת החיפוש. לפרטים מלאים ועדכניים יש לעבור לאתר מוסד הלימודים.</div>
              </CardContent>
            </Card>
            {sections.length > 0 && <Card className="course-detail-toc"><CardContent><h2>בעמוד הזה</h2><nav aria-label="נושאי מידע על הקורס">{sections.map((section, index) => <a key={index} href={`#section-${section.id}`}>{section.title}</a>)}</nav></CardContent></Card>}
          </aside>
        </div>
      </div>
    </main>
  );
}
