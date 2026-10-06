"use client";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addCourseAction } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function CourseForm(){
  const [state, action, pending] = useActionState(addCourseAction, {error:"",success:""});
  return <Card className="manual-course-card"><CardHeader><CardTitle className="text-xl">רוצה להוסיף קורס שמצאת?</CardTitle><CardDescription>אפשר להוסיף ידנית קורס שתרצה לזכור ולבדוק בהמשך.</CardDescription></CardHeader><CardContent><form action={action} className="modern-form"><label>שם הקורס<Input name="title" required placeholder="לדוגמה: Full Stack Development"/></label><label>מוסד לימודים<Input name="provider" placeholder="שם המכללה או בית הספר"/></label><label>תחום<Input name="category" placeholder="לדוגמה: פיתוח תוכנה"/></label><label>הערה אישית<textarea name="notes" rows="3" placeholder="מה עניין אותך בקורס?"/></label>{state.error && <p className="error">{state.error}</p>}{state.success && <p className="success">{state.success}</p>}<Button className="h-10 w-full" disabled={pending}>{pending ? <><Spinner/> שומר...</> : <><Plus/> הוסף לרשימה</>}</Button></form></CardContent></Card>;
}
