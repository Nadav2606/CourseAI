import "./globals.css";
import Navbar from "./components/Navbar";
import { Geist } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "CourseAI",
  description: "חיפוש ושמירת קורסים עם סוכן AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={geist.variable}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
