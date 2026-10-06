import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Conversation from "@/app/models/Conversation";
import AssistantForm from "@/app/components/AssistantForm";

export default async function Assistant() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  await connectDB();
  const conversation = await Conversation.findOne({ userId: user.id }).lean();
  const initialMessages =
    conversation?.messages?.map((message) => ({
      role: message.role,
      text: message.text,
    })) || [];

  return (
    <main className="narrow">
      <div className="pageHead">
        <p className="eyebrow">הכוונה אישית ללימודים</p>
        <h1>בוא נמצא את המסלול שמתאים לך</h1>
        <p>ספר לי מה מעניין אותך ומה המטרות שלך, ואעזור לך למקד את אפשרויות הלימוד שמתאימות לך.</p>
      </div>
      <AssistantForm initialMessages={initialMessages} />
    </main>
  );
}
