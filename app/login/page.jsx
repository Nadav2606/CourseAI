import { redirect } from "next/navigation";
import { getSessionUser } from "@/app/lib/auth";
import AuthForm from "@/app/components/AuthForm";
export default async function Login() {
  if (await getSessionUser()) redirect("/discover");
  return (
    <main className="narrow">
      <AuthForm mode="login" />
    </main>
  );
}
