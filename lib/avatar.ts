export const avatarMaxBytes = 5 * 1024 * 1024;
export const avatarMimeTypes = ["image/jpeg", "image/png", "image/webp"];
export const avatarPath = "/api/profile-avatar/";

export function avatarFileError(file: File) {
  if (file.size === 0 || !avatarMimeTypes.includes(file.type)) {
    return "Selecciona una imagen JPG, PNG o WebP válida.";
  }
  if (file.size > avatarMaxBytes) return "La foto debe pesar como máximo 5 MB.";
  return null;
}
