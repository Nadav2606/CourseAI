import { redirect } from "next/navigation"; import { getSessionUser } from "@/app/lib/auth"; import AuthForm from "@/app/components/AuthForm";
export default async function Register(){if(await getSessionUser()) redirect("/courses"); return <main className="narrow"><AuthForm mode="register"/></main>}
