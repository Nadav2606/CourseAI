"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import SaveCourseButton from "@/app/components/SaveCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ExpandableCourseCard({
  title,
  description,
  provider,
  category,
  url,
  loggedIn,
  initiallySaved,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`result-card flex min-w-0 flex-col border-slate-200 bg-white shadow-sm ${expanded ? "result-card-expanded" : ""}`}>
      <CardHeader className="space-y-4">
        <div className="course-card-meta">
          <Badge variant="secondary" className="course-provider rounded-full">
            {provider}
          </Badge>
          <span className="course-category">{category}</span>
        </div>

        <CardTitle className={expanded ? "course-result-title" : "course-result-title line-clamp-3"}>
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        {description ? (
          <>
            <p className={`course-result-description ${expanded ? "" : "line-clamp-5"}`}>
              {description}
            </p>
            <button
              type="button"
              className="course-expand-button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
            >
              {expanded ? (
                <>
                  הצג פחות <ChevronUp size={18} />
                </>
              ) : (
                <>
                  הצג עוד <ChevronDown size={18} />
                </>
              )}
            </button>
          </>
        ) : (
          <p className="course-result-description text-slate-400">
            פרטים נוספים על הקורס זמינים בעמוד הקורס.
          </p>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-slate-100 bg-slate-50/70">
        <SaveCourseButton
          loggedIn={loggedIn}
          initiallySaved={initiallySaved}
          course={{ title, provider, category, url }}
        />
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button className="h-10 w-full">
            לפרטים <ExternalLink />
          </Button>
        </a>
      </CardFooter>
    </Card>
  );
}
