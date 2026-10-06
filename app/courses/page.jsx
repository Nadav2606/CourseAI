import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ExternalLink, Heart, Trash2 } from "lucide-react";
import { getSessionUser } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Course from "@/app/models/Course";
import { deleteCourseAction } from "@/actions/courses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Courses() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  await connectDB();
  const courses = await Course.find({ userId: user.id }).sort({ createdAt: -1 }).lean();

  return (
    <main dir="rtl" className="courses-page">
      <section className="courses-header">
        <div>
          <Badge variant="secondary" className="mb-4 rounded-full"><Heart className="fill-current" /> האוסף האישי שלך</Badge>
          <h1>הקורסים שלי</h1>
          <p>כל הקורסים ששמרת במקום אחד, כדי שתוכל לחזור אליהם, להשוות ולבחור בקצב שלך.</p>
        </div>
        <div className="courses-count"><strong>{courses.length}</strong><span>קורסים שמורים</span></div>
      </section>

      <section className="courses-library">
        <div className="courses-list-head">
          <div><h2>הרשימה שלי</h2><p>הקורסים האחרונים ששמרת יופיעו ראשונים.</p></div>
          <Link href="/discover"><Button className="action-button">למציאת קורסים</Button></Link>
        </div>

        {courses.length === 0 ? (
          <Card className="courses-empty"><CardContent><div className="feature-icon"><BookOpen /></div><h3>הרשימה שלך מחכה לקורס הראשון</h3><p>מצא קורס שמעניין אותך ולחץ על הלב כדי לשמור אותו כאן.</p><Link href="/discover"><Button className="action-button">למציאת קורס</Button></Link></CardContent></Card>
        ) : (
          <div className="course-library-grid">
            {courses.map((c) => (
              <Card className="library-card" key={c._id.toString()}>
                <CardHeader><div className="saved-course-meta"><Badge variant="secondary">{c.category || "קורס שמור"}</Badge><Heart className="size-5 fill-violet-600 text-violet-600" /></div><CardTitle className="text-xl leading-7">{c.title}</CardTitle></CardHeader>
                <CardContent className="flex-1"><p className="provider-line">{c.provider || "מוסד לימודים"}</p>{c.notes && <p className="course-notes">{c.notes}</p>}<p className="saved-date">נשמר בתאריך {new Date(c.createdAt).toLocaleDateString("he-IL")}</p></CardContent>
                <CardFooter className="library-actions">{c.sourceUrl && <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-1"><Button className="w-full action-button" variant="outline">לפרטים <ExternalLink /></Button></a>}<form action={deleteCourseAction}><input type="hidden" name="id" value={c._id.toString()} /><Button className="action-button" type="submit" variant="destructive" size="icon" aria-label="הסר קורס"><Trash2 /></Button></form></CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
