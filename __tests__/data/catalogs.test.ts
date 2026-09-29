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
  WORKSHOP_SESSIONS,
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
  it("expone ambos cursos online de marketing", () => {
    const all = getAllOnlineCourses();
    expect(all).toHaveLength(2);
    expect(all.map((c) => c.slug)).toEqual([
      "cake-de-pina",
      "merengue-italiano",
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
  it("todas las sesiones del calendario resuelven a un workshop", () => {
    const events = getCalendarEvents();
    expect(events.length).toBe(WORKSHOP_SESSIONS.length);
    for (const event of events) {
      expect(event.workshop.slug).toBe(event.session.workshopSlug);
      expect(event.card.isWorkshop).toBe(true);
    }
  });

  it("agrupa eventos por fecha", () => {
    const byDate = getEventsByDateKey(getCalendarEvents());
    expect(byDate["2026-10-04"]).toHaveLength(1);
    expect(byDate["2026-10-04"][0].workshop.slug).toBe("tortas-basicas");
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
