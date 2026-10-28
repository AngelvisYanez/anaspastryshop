import { describe, expect, it } from "vitest";
import {
  normalize,
  resolveCourseCover,
  withCourseCover,
} from "@/lib/data/onlineCourseCovers";
import {
  getAllOnlineCourses,
  getOnlineCourseBySlug,
  toOnlineFormacionCard,
} from "@/lib/data/online-courses";
import {
  getCalendarEvents,
  getEventsByDateKey,
  parseLocalDate,
  toDateKey,
} from "@/lib/data/workshop-schedule";
import { getNavbarTheme } from "@/components/getNavbarTheme";

describe("onlineCourseCovers", () => {
  it("normaliza acentos y mayúsculas", () => {
    expect(normalize("  Cake de Piña  ")).toBe("cake de pina");
  });

  it("resuelve portada por slug", () => {
    expect(
      resolveCourseCover({
        title: "Cualquiera",
        slug: "cake-de-pina",
        image: "/fallback.png",
        isWorkshop: false,
      }),
    ).toBe("/curso-online-cake-de-pina.png");
  });

  it("resuelve portada por keyword de título", () => {
    expect(
      resolveCourseCover({
        title: "Masterclass de Merengue Italiano",
        slug: "otro",
        image: null,
        isWorkshop: false,
      }),
    ).toBe("/curso-online-merengue-italiano.png");
  });

  it("forza null en workshops", () => {
    expect(
      resolveCourseCover({
        title: "Tortas Básicas",
        slug: "tortas-basicas",
        image: "/x.png",
        isWorkshop: true,
      }),
    ).toBeNull();
  });

  it("withCourseCover muta solo la imagen", () => {
    const card = withCourseCover({
      id: "1",
      title: "Cake de Piña",
      slug: "cake-de-pina",
      description: "x",
      price: 45,
      image: "/old.png",
      isWorkshop: false,
    });
    expect(card.image).toBe("/curso-online-cake-de-pina.png");
    expect(card.title).toBe("Cake de Piña");
  });
});

describe("online-courses catalog", () => {
  it("expone los cursos online de marketing", () => {
    const all = getAllOnlineCourses();
    expect(all.map((c) => c.slug)).toEqual([
      "cake-de-pina",
      "merengue-italiano",
      "tortas-basicas-online",
      "pan-de-jamon",
    ]);
  });

  it("busca por slug o id", () => {
    expect(getOnlineCourseBySlug("cake-de-pina")?.title).toMatch(/piña/i);
    expect(getOnlineCourseBySlug("MERENGUE-ITALIANO")?.price).toBe(35);
    expect(getOnlineCourseBySlug("")).toBeUndefined();
  });

  it("toOnlineFormacionCard usa bagId = slug", () => {
    const course = getAllOnlineCourses()[0];
    const card = toOnlineFormacionCard(course);
    expect(card.bagId).toBe(course.slug);
    expect(card.isWorkshop).toBe(false);
  });
});

describe("workshop-schedule", () => {
  const row = (id: string, date: string) => ({
    id,
    slug: "tortas-basicas",
    title: "WORKSHOP TORTAS BÁSICAS",
    description: "Aprende pastelería",
    price: 70,
    image: null,
    content: JSON.stringify({ isWorkshop: true, slug: "tortas-basicas", workshopDate: date }),
    isLive: true,
    level: "Inicial",
  });

  it("usa la fecha vigente de cada workshop y mueve el evento al editarla", () => {
    const before = getEventsByDateKey(getCalendarEvents([row("course-1", "2026-10-04")]));
    const after = getEventsByDateKey(getCalendarEvents([row("course-1", "2026-11-22")]));
    expect(before["2026-10-04"]).toHaveLength(1);
    expect(after["2026-10-04"]).toBeUndefined();
    expect(after["2026-11-22"][0].card.bagId).toBe("course-1");
  });

  it("agrupa fechas coincidentes, ordena y omite fechas sin confirmar", () => {
    const distinct = (id: string, date: string) => ({
      ...row(id, date),
      slug: id,
      title: id,
      content: JSON.stringify({ isWorkshop: true, slug: id, workshopDate: date }),
    });
    const events = getCalendarEvents([
      distinct("late", "2026-11-22"),
      distinct("invalid", "Por confirmar"),
      distinct("early", "2026-10-04"),
      distinct("same-day", "2026-10-04"),
    ]);
    expect(events.map((event) => event.session.date)).toEqual([
      "2026-10-04", "2026-10-04", "2026-11-22",
    ]);
    expect(getEventsByDateKey(events)["2026-10-04"]).toHaveLength(2);
  });

  it("muestra solo el registro más reciente si hay duplicados del mismo workshop", () => {
    const older = { ...row("old", "2026-10-04"), createdAt: new Date("2026-01-01") };
    const newer = { ...row("new", "2026-11-22"), createdAt: new Date("2026-02-01") };
    const events = getCalendarEvents([older, newer]);
    expect(events).toHaveLength(1);
    expect(events[0].session.id).toBe("new");
  });

  it("parseLocalDate / toDateKey son inversos en local", () => {
    const iso = "2026-11-08";
    expect(toDateKey(parseLocalDate(iso))).toBe(iso);
  });
});

describe("getNavbarTheme", () => {
  it("usa logo blanco sobre héroes oscuros sin scroll", () => {
    const theme = getNavbarTheme({
      forceSolid: false,
      scrolled: false,
      pathname: "/cursos",
    });
    expect(theme.isSolid).toBe(false);
    expect(theme.logoSrc).toContain("white");
    expect(theme.linkColor).toContain("text-white");
  });

  it("solidifica al hacer scroll o forceSolid", () => {
    const scrolled = getNavbarTheme({
      forceSolid: false,
      scrolled: true,
      pathname: "/cursos",
    });
    expect(scrolled.isSolid).toBe(true);
    expect(scrolled.logoSrc).not.toContain("white");

    const forced = getNavbarTheme({
      forceSolid: true,
      scrolled: false,
      pathname: "/cursos",
    });
    expect(forced.isSolid).toBe(true);
  });

  it("en home (sin dark hero) usa logo rosa", () => {
    const theme = getNavbarTheme({
      forceSolid: false,
      scrolled: false,
      pathname: "/",
    });
    expect(theme.logoSrc).toBe("/logo-anas-pastry-shop.png");
  });
});
