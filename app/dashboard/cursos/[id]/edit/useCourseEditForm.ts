"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCourse } from "@/lib/actions/cursos";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

export interface TaskForm {
  title: string;
  summary: string;
}

export interface ModuleForm {
  title: string;
  videoUrl: string;
  tasks: TaskForm[];
}

export function useCourseEditForm(course: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialWorkshop = parseWorkshopDetails(course.content, course.isLive, course.title);

  // react-doctor-disable-next-line react-doctor/no-derived-useState -- editable form state; this component is remounted via `key={course.id}`
  const [title, setTitle] = useState(course.title);
  // react-doctor-disable-next-line react-doctor/no-derived-useState -- editable form state; this component is remounted via `key={course.id}`
  const [description, setDescription] = useState(course.description);
  const [price, setPrice] = useState(() => course.price.toString());
  const [introVideo, setIntroVideo] = useState(course.introVideo || "");
  const [coverImage, setCoverImage] = useState(course.image || "");
  const [isLive, setIsLive] = useState(course.isLive || initialWorkshop.isWorkshop);
  const [liveUrl] = useState(course.liveUrl || "");
  const [location, setLocation] = useState(
    initialWorkshop.location || "Caracas, Las Mercedes — Sede Ana's Pastry Shop",
  );
  const [workshopDate, setWorkshopDate] = useState(initialWorkshop.workshopDate || "");
  const [workshopTime, setWorkshopTime] = useState(
    initialWorkshop.workshopTime || "09:00 AM — 05:00 PM",
  );
  const [status] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">(
    (course.status as "DRAFT" | "PUBLISHED" | "SCHEDULED") || "PUBLISHED",
  );
  const [publishedAt] = useState(
    course.publishedAt ? new Date(course.publishedAt).toISOString().slice(0, 16) : "",
  );

  const initialModules = course.courseModules.map((m: any) => ({
    title: m.title,
    videoUrl: m.videoUrl || "",
    tasks: m.lessons.map((l: any) => ({
      title: l.title,
      summary: l.summary || "",
    })),
  }));

  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [modules, setModules] = useState<ModuleForm[]>(
    initialModules.length
      ? initialModules
      : [{ title: "Módulo 1: Introducción", videoUrl: "", tasks: [{ title: "", summary: "" }] }],
  );

  function handleAddModule() {
    const newIndex = modules.length;
    setModules([
      ...modules,
      { title: `Módulo ${newIndex + 1}: Nuevo Módulo`, videoUrl: "", tasks: [] },
    ]);
    setOpenModuleIndex(newIndex);
  }

  function handleRemoveModule(mIndex: number) {
    setModules(modules.filter((_, i) => i !== mIndex));
    setOpenModuleIndex(null);
  }

  function handleAddTask(mIndex: number) {
    const next = [...modules];
    next[mIndex].tasks.push({ title: "", summary: "" });
    setModules(next);
  }

  function handleRemoveTask(mIndex: number, tIndex: number) {
    const next = [...modules];
    next[mIndex].tasks = next[mIndex].tasks.filter((_, i) => i !== tIndex);
    setModules(next);
  }

  function handleModuleChange(mIndex: number, field: "title" | "videoUrl", val: string) {
    const next = [...modules];
    next[mIndex][field] = val;
    setModules(next);
  }

  function handleTaskChange(mIndex: number, tIndex: number, field: keyof TaskForm, val: string) {
    const next = [...modules];
    next[mIndex].tasks[tIndex][field] = val;
    setModules(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const totalClasses = modules.reduce((acc, m) => acc + m.tasks.length, 0);
    const totalHours = Math.ceil(totalClasses * 0.5) || 1;

    try {
      const res = await updateCourse(course.id, {
        title,
        description,
        price: parseFloat(price),
        totalHours,
        totalClasses,
        language: course.language || "Español",
        level: course.level || "Intermedio",
        image: coverImage || undefined,
        introVideo: introVideo || undefined,
        isLive,
        liveUrl: isLive ? liveUrl : undefined,
        location: isLive ? location : undefined,
        workshopDate: isLive ? workshopDate : undefined,
        workshopTime: isLive ? workshopTime : undefined,
        status,
        publishedAt: status === "SCHEDULED" ? publishedAt : undefined,
        modules: modules.map((m) => ({
          title: m.title,
          videoUrl: m.videoUrl || undefined,
          lessons: m.tasks.map((t) => ({
            title: t.title,
            summary: t.summary || undefined,
          })),
        })),
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard/cursos");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    title,
    setTitle,
    description,
    setDescription,
    price,
    setPrice,
    introVideo,
    setIntroVideo,
    coverImage,
    setCoverImage,
    isLive,
    setIsLive,
    location,
    setLocation,
    workshopDate,
    setWorkshopDate,
    workshopTime,
    setWorkshopTime,
    openModuleIndex,
    setOpenModuleIndex,
    modules,
    handleAddModule,
    handleRemoveModule,
    handleAddTask,
    handleRemoveTask,
    handleModuleChange,
    handleTaskChange,
    handleSubmit,
  };
}
