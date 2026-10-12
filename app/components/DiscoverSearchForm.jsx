"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export default function DiscoverSearchForm({ initialQuery = "" }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [pending, setPending] = useState(false);

  function submit(event) {
    event.preventDefault();

    const value = query.trim();

    if (!value || pending || value === initialQuery.trim()) return;

    setPending(true);
    router.push(`/discover?q=${encodeURIComponent(value)}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
    >
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="מה תרצה ללמוד? לדוגמה: Full Stack"
        className="h-12 bg-white px-4 text-base shadow-sm"
        aria-label="חיפוש קורסים"
      />

      <Button
        type="submit"
        size="lg"
        disabled={pending || !query.trim()}
        className="
          h-12 min-w-36 gap-2 rounded-xl
          bg-violet-600 px-8
          text-base font-bold text-white
          shadow-md shadow-violet-600/20
          transition-all duration-200
          hover:-translate-y-0.5
          hover:bg-violet-700
          hover:shadow-lg
          hover:shadow-violet-600/30
          active:translate-y-0
          disabled:translate-y-0
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {pending ? (
          <>
            <Spinner />
            מחפש...
          </>
        ) : (
          <>
            <Search className="size-5" />
            חיפוש
          </>
        )}
      </Button>
    </form>
  );
}
