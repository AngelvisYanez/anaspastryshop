export function courseImageUrl(id: string, image: string | null | undefined): string | null {
  if (!image) return null;
  return image.startsWith('data:image/') ? `/api/course-image/${id}` : image;
}
