import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function LoadingCourseDetails() {
  return <main className="course-detail-page" dir="rtl"><div className="course-detail-shell"><Card><CardContent className="course-detail-loading" role="status"><div className="result-course-icon"><BookOpen size={28} /></div><h1>טוענים את פרטי הקורס</h1><p>אוספים את המידע מאתר הקורס ומכינים עבורך תצוגה מסודרת.</p><Spinner /></CardContent></Card></div></main>;
}
