"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function PopularCategories({ categories }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  function choose(query) {
    if (loading) return;
    setLoading(query);
    router.push(`/discover?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Card key={category.query} className="course-category-card h-full border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="category-icon">{category.icon}</div>
            <CardTitle className="text-xl">{category.title}</CardTitle>
            <CardDescription className="min-h-12 leading-6">{category.description}</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto border-slate-100 bg-slate-50/70">
            <Button variant="outline" className="h-10 w-full" disabled={Boolean(loading)} onClick={() => choose(category.query)}>
              {loading === category.query ? <><Spinner /> מחפש קורסים...</> : "הצג קורסים"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
