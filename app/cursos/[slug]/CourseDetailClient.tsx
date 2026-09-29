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
  paymentMethods = [],
  children,
}: {
  course: any;
  hasPaid: boolean;
  workshopInfo?: WorkshopDetails;
  paymentMethods?: string[];
  children?: ReactNode;
}) {
  const isWorkshop =
    workshopInfo?.isWorkshop ??
    (course.isLive || /workshop|taller|presencial/i.test(course.title));
  const isDecoration = /decoraci|alisad|torta|pastel/i.test(course.title);
  // Solo workshops reservan con el 50%. Los cursos online se pagan completos.
  const reservationFee = isWorkshop ? Math.round(course.price * 0.5) : 0;
  const remainderFee = isWorkshop ? course.price - reservationFee : 0;

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
        paymentMethods={paymentMethods}
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
