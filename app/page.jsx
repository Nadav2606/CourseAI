import Link from "next/link";
import { BookOpen, Bot, Search, Sparkles } from "lucide-react";
import { getSessionUser } from "@/app/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const user = await getSessionUser();

  return (
    <main dir="rtl">
      <section className="home-hero">
        <div className="home-hero-inner">
          <Badge className="home-badge" variant="secondary">
            <Sparkles /> הדרך החכמה לבחור מה ללמוד
          </Badge>
          <h1>{user ? `היי ${user.name}, מה תרצה ללמוד עכשיו?` : "הקורס הנכון יכול לשנות את הכיוון שלך"}</h1>
          <p>גלה קורסים שמתאימים למטרות שלך, שמור את האפשרויות שמעניינות אותך וקבל הכוונה אישית בדרך לבחירה הנכונה.</p>
          <div className="actions">
            <Link href="/discover"><Button size="lg" className="home-primary action-button">למציאת קורס <Search /></Button></Link>
            <Link href="/assistant"><Button size="lg" variant="outline" className="home-secondary action-button">התייעצות אישית <Bot /></Button></Link>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-heading">
          <span>כל מה שצריך במקום אחד</span>
          <h2>פחות התלבטויות, יותר החלטות טובות</h2>
          <p>כלים פשוטים שיעזרו לך למצוא מסלול לימודים, לשמור אפשרויות ולבחור בביטחון.</p>
        </div>
        <div className="home-feature-grid">
          <Card className="home-feature-card"><CardHeader><div className="feature-icon"><Search /></div><CardTitle>חיפוש ממוקד</CardTitle></CardHeader><CardContent><p>מצא קורסים ומסלולי לימוד במגוון תחומים והשווה בין האפשרויות שמעניינות אותך.</p></CardContent></Card>
          <Card className="home-feature-card"><CardHeader><div className="feature-icon"><BookOpen /></div><CardTitle>רשימה אישית</CardTitle></CardHeader><CardContent><p>שמור את הקורסים שאהבת וחזור אליהם בכל זמן, בלי להתחיל את החיפוש מחדש.</p></CardContent></Card>
          <Card className="home-feature-card"><CardHeader><div className="feature-icon"><Bot /></div><CardTitle>הכוונה אישית</CardTitle></CardHeader><CardContent><p>ספר לסוכן מה חשוב לך וקבל עזרה ממוקדת לפי המטרות, הזמן וההעדפות שלך.</p></CardContent></Card>
        </div>
      </section>
    </main>
  );
}
