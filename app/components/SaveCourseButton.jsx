"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Heart } from "lucide-react";
import { saveDiscoveredCourseAction } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function SaveCourseButton({ course, initiallySaved = false, loggedIn = false }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveDiscoveredCourseAction, { saved: initiallySaved, error: "" });

  if (!loggedIn) {
    return <Button variant="outline" className="h-10 flex-1 action-button" onClick={() => router.push("/login")}><Heart /> שמור</Button>;
  }

  return (
    <form action={action} className="flex-1">
      <input type="hidden" name="title" value={course.title || ""} />
      <input type="hidden" name="provider" value={course.provider || ""} />
      <input type="hidden" name="category" value={course.category || ""} />
      <input type="hidden" name="sourceUrl" value={course.url || ""} />
      <Button type="submit" variant={state.saved ? "secondary" : "outline"} className="h-10 w-full action-button" disabled={pending || state.saved} aria-label={state.saved ? "הקורס נשמר" : "שמור קורס"}>
        {pending ? <Spinner /> : <Heart className={state.saved ? "fill-current" : ""} />}
        {pending ? "שומר..." : state.saved ? "נשמר" : "שמור"}
      </Button>
    </form>
  );
}
