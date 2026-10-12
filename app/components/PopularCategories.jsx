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
    <div className="category-grid">
      {categories.map((category) => (
        <Card key={category.query} className="course-category-card">
          <CardHeader className="category-card-header">
            <div className="category-icon" aria-hidden="true">{category.icon}</div>
            <CardTitle className="category-card-title">{category.title}</CardTitle>
            <CardDescription className="category-card-description">{category.description}</CardDescription>
          </CardHeader>
          <CardFooter className="category-card-footer">
            <Button variant="outline" className="category-card-button h-10 w-full" disabled={Boolean(loading)} onClick={() => choose(category.query)}>
              {loading === category.query ? <><Spinner /> מחפש קורסים...</> : "הצג קורסים"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
