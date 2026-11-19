"use client";

import { useActionState, useState } from "react";
import { completeCourseModule, submitCourseReview } from "@/lib/actions/course-reviews";
import type { CourseReviewProgress } from "@/lib/data/course-reviews";

const buttonClass = "rounded-xl bg-accent-solid px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50";

export function CourseReviewPrompt({ courseId, moduleId, moduleCount, progress }: {
  courseId: string;
  moduleId: string;
  moduleCount: number;
  progress: CourseReviewProgress;
}) {
  const [completionError, complete, completing] = useActionState(
    () => completeCourseModule(courseId, moduleId),
    null,
  );
  const [reviewError, submit, submitting] = useActionState(submitCourseReview.bind(null, courseId), null);
  const [comment, setComment] = useState("");
  const completedCount = progress.completedModuleIds.length;
  const moduleCompleted = progress.completedModuleIds.includes(moduleId);

  return (
    <section className="rounded-2xl border border-card-border bg-card p-5 text-foreground sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold" role="status">
          {completedCount} de {moduleCount} módulos vistos{moduleCompleted && " · Módulo visto"}
        </p>
        {!moduleCompleted && (
          <form action={complete}>
            <button className={buttonClass} disabled={completing}>
              {completing ? "Guardando…" : "Marcar como visto"}
            </button>
          </form>
        )}
      </div>
      {completionError && <p className="mt-3 text-sm" role="alert">{completionError}</p>}

      {progress.reviewed ? (
        <p className="mt-4 text-sm text-muted" role="status">Gracias por compartir tu reseña.</p>
      ) : completedCount === moduleCount && (
        <form action={submit} className="mt-4 space-y-3 border-t border-card-border pt-4">
          <label htmlFor="course-review-comment" className="block text-lg font-bold">
            ¿Qué te pareció el curso?
          </label>
          <textarea
            id="course-review-comment"
            name="comment"
            required
            maxLength={2000}
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="block w-full rounded-xl border border-card-border bg-background p-3 text-sm"
          />
          {reviewError && <p className="text-sm" role="alert">{reviewError}</p>}
          <button className={buttonClass} disabled={submitting}>
            {submitting ? "Enviando…" : "Enviar reseña"}
          </button>
        </form>
      )}
    </section>
  );
}
