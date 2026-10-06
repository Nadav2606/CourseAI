import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-50/70">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center sm:px-8">
          <div className="mb-4 flex items-center justify-center gap-2 text-violet-700">
            <Spinner className="size-5" />
            <span className="font-semibold">
              מחפש עבורך את האפשרויות המתאימות
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 sm:text-4xl">
            עוד רגע התוצאות כאן
          </h1>
          <p className="mt-3 text-slate-500">
            אנחנו מרכזים עבורך קורסים רלוונטיים כדי שיהיה קל להשוות ולבחור.
          </p>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:px-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="bg-white">
            <CardHeader>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="mt-3 h-7 w-4/5" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-2/3" />
              <Skeleton className="mt-8 h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
