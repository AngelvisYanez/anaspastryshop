"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { parseWorkshopDetails, type WorkshopDetails } from "@/lib/utils/workshop";
import {
  WorkshopLogisticsBanner,
  CourseAccessGuard,
  CourseModulesPanel,
} from "./CourseViewerParts";

interface Lesson {
  id: string;
  title: string;
  duration: number;
  videoUrl?: string | null;
  summary?: string | null;
  isFree?: boolean;
}

interface CourseModule {
  id: string;
  title: string;
  order: number;
  duration?: number | null;
  videoUrl?: string | null;
  lessons: Lesson[];
}

interface CourseViewerProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    image: string;
    videoUrl?: string | null;
    totalHours: number;
    content?: string | null;
    isLive?: boolean;
    instructor: {
      name: string | null;
      image?: string | null;
    };
    courseModules: CourseModule[];
  };
  hasAccess: boolean;
  canManage?: boolean;
  isAdminOrInstructor?: boolean;
  workshopInfo?: WorkshopDetails;
}

export default function DashboardCourseViewer({
  course,
  hasAccess,
  canManage = false,
  isAdminOrInstructor = false,
  workshopInfo: passedWorkshopInfo,
}: CourseViewerProps) {
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const isManager = canManage || isAdminOrInstructor;
  const workshopInfo =
    passedWorkshopInfo || parseWorkshopDetails(course.content, course.isLive, course.title);
  const isWorkshop = workshopInfo.isWorkshop;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link
            href={isManager ? "/dashboard/cursos" : "/dashboard/mis-cursos"}
            className="hover:text-foreground transition-colors"
          >
            {isManager ? "Cursos" : "Mis Cursos"}
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-bold truncate max-w-[200px] sm:max-w-xs">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isManager && (
            <Link
              href={`/dashboard/cursos/${course.id}/edit`}
              className="bg-section-alt hover:bg-card-hover border border-card-border text-foreground px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              Editar Curso
            </Link>
          )}
          <Link
            href={`/cursos/${course.id}`}
            target="_blank"
            className="bg-accent-subtle hover:bg-accent/20 text-accent px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <ExternalLink size={14} /> Ver Página Pública
          </Link>
        </div>
      </div>

      {isWorkshop && (
        <WorkshopLogisticsBanner
          workshopInfo={workshopInfo}
          instructorName={course.instructor.name}
        />
      )}

      {!hasAccess && <CourseAccessGuard courseId={course.id} />}

      {hasAccess && (
        <CourseModulesPanel
          course={course}
          selectedModuleIndex={selectedModuleIndex}
          onSelectModule={setSelectedModuleIndex}
        />
      )}
    </div>
  );
}
