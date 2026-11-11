import { describe, expect, it } from "vitest";
import { courseImageUrl, EMBEDDED_COURSE_IMAGE_MARKER } from "@/lib/data/course-image-url";

describe("courseImageUrl", () => {
  it("returns null when there is no image", () => {
    expect(courseImageUrl("abc", null, new Date("2026-01-01"))).toBeNull();
    expect(courseImageUrl("abc", undefined)).toBeNull();
  });

  it("keeps public paths and remote URLs as-is", () => {
    expect(courseImageUrl("abc", "/curso-online-cake-de-pina.png")).toBe(
      "/curso-online-cake-de-pina.png",
    );
    expect(courseImageUrl("abc", "https://cdn.example/cover.jpg")).toBe(
      "https://cdn.example/cover.jpg",
    );
  });

  it("versions embedded covers so CDN caches bust on update", () => {
    const updatedAt = new Date("2026-11-11T12:00:00.000Z");
    expect(courseImageUrl("course-1", "data:image/png;base64,aaa", updatedAt)).toBe(
      `/api/course-image/course-1?v=${updatedAt.getTime()}`,
    );
    expect(courseImageUrl("course-1", EMBEDDED_COURSE_IMAGE_MARKER, updatedAt)).toBe(
      `/api/course-image/course-1?v=${updatedAt.getTime()}`,
    );
  });

  it("omits the version query when updatedAt is missing", () => {
    expect(courseImageUrl("course-1", "data:image/jpeg;base64,bbb")).toBe(
      "/api/course-image/course-1",
    );
  });
});
