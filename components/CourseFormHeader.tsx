import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function CourseFormHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <Link
        href="/dashboard/cursos"
        aria-label="Volver al listado de cursos"
        className="p-2 hover:bg-card rounded-xl transition-colors border border-transparent hover:border-card-border"
      >
        <ArrowLeft size={24} className="text-foreground" />
      </Link>
      <div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">{title}</h1>
        <p className="text-muted mt-1 font-medium">{description}</p>
      </div>
    </div>
  );
}
