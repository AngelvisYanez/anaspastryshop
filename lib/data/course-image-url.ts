/** Marker used by catalog queries instead of embedding base64 in the page cache. */
export const EMBEDDED_COURSE_IMAGE_MARKER = "data:image/";

/**
 * Public cover URL for a course/workshop.
 * Embedded data-URI covers are served via the versioned API route so CDN/browser
 * caches bust whenever `updatedAt` changes after a cover upload.
 */
export function courseImageUrl(
  id: string,
  image: string | null | undefined,
  updatedAt?: Date | string | null,
): string | null {
  if (!image) return null;
  if (image.startsWith("data:image/")) {
    const version = updatedAt != null ? `?v=${new Date(updatedAt).getTime()}` : "";
    return `/api/course-image/${id}${version}`;
  }
  return image;
}
