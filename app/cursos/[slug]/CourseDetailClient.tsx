"use client";

import Navbar from "@/components/Navbar";
import type { ReactNode } from "react";
import type { WorkshopDetails } from "@/lib/utils/workshop";
import { CourseDetailHero } from "./CourseDetailHero";
import { CourseDetailBody } from "./CourseDetailBody";

export default function CourseDetailClient({
  course,
  hasPaid,
  workshopInfo,
  children,
}: {
  course: any;
  hasPaid: boolean;
  workshopInfo?: WorkshopDetails;
  children?: ReactNode;
}) {
  const isWorkshop =
    workshopInfo?.isWorkshop ??
    (course.isLive || /workshop|taller|presencial/i.test(course.title));
  const isDecoration = /decoraci|alisad|torta|pastel/i.test(course.title);
  const reservationFee = Math.round(course.price * 0.5);
  const remainderFee = course.price - reservationFee;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <CourseDetailHero
        course={course}
        hasPaid={hasPaid}
        workshopInfo={workshopInfo}
        isWorkshop={isWorkshop}
        reservationFee={reservationFee}
        remainderFee={remainderFee}
      />
      <CourseDetailBody
        course={course}
        hasPaid={hasPaid}
        workshopInfo={workshopInfo}
        isWorkshop={isWorkshop}
        isDecoration={isDecoration}
        reservationFee={reservationFee}
      />
      {children}
    </main>
  );
}
