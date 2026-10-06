import Link from "next/link";
import { getSessionUser } from "@/app/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="nav">
      <Link className="brand" href="/">CourseAI</Link>
      <nav>
        <Link className="navLink" href="/discover">חיפוש קורסים</Link>
        {user && <Link className="navLink" href="/courses">הקורסים שלי</Link>}
        {user && <Link className="navLink" href="/assistant">התייעצות אישית</Link>}
        {!user ? (
          <>
            <Link className="navLink" href="/login">התחברות</Link>
            <Link className="button small navRegister" href="/register">הרשמה</Link>
          </>
        ) : (
          <form action={logoutAction}>
            <button className="linkButton navLink">התנתקות ({user.name})</button>
          </form>
        )}
      </nav>
    </header>
  );
}
