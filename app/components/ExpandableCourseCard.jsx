"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, BookOpen } from "lucide-react";
import SaveCourseButton from "@/app/components/SaveCourseButton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ExpandableCourseCard({
  detailsId,
  title,
  description,
  provider,
  category,
  url,
  loggedIn,
  initiallySaved,
}) {
  return (
    <Card className="result-card course-result-card">
      <CardHeader className="course-result-header">
        <div className="result-course-icon" aria-hidden="true"><BookOpen size={23} /></div>
        <div className="course-result-meta">
          <Badge variant="secondary" className="course-provider" dir="auto" title={provider}>
            {provider}
          </Badge>
          <span className="course-topic">{category}</span>
        </div>

        <CardTitle dir="auto" className="course-result-title line-clamp-3">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="course-result-content">
        {description ? (
          <>
            <p className="course-result-description line-clamp-3">
              {description}
            </p>
            {detailsId ? (
              <Link href={`/discover/course/${detailsId}`} prefetch={false} className="course-expand-button">
                הצג עוד <ArrowLeft size={17} />
              </Link>
            ) : (
              <span className="course-detail-unavailable">מידע נוסף זמין באתר הקורס</span>
            )}
          </>
        ) : (
          <>
            <p className="course-result-description text-slate-400">פרטים נוספים על הקורס זמינים בעמוד הקורס.</p>
            {detailsId && <Link href={`/discover/course/${detailsId}`} prefetch={false} className="course-expand-button">הצג עוד <ArrowLeft size={17} /></Link>}
          </>
        )}
      </CardContent>

      <CardFooter className="course-result-footer">
        <SaveCourseButton
          loggedIn={loggedIn}
          initiallySaved={initiallySaved}
          course={{ title, provider, category, url }}
        />
        <a href={url} target="_blank" rel="noopener noreferrer" className="course-details-link">
          לפרטים <ExternalLink size={17} />
        </a>
      </CardFooter>
    </Card>
  );
}
