import sharp from "sharp";

const acceptedFormats = new Set(["jpeg", "png", "webp"]);

export async function processAvatar(file: File) {
  const image = sharp(Buffer.from(await file.arrayBuffer()), {
    limitInputPixels: 32_000_000,
    failOn: "warning",
  });
  const { format } = await image.metadata();
  if (!format || !acceptedFormats.has(format)) {
    throw new Error("Formato de imagen inválido.");
  }
  return image.rotate().resize(512, 512, { fit: "cover", withoutEnlargement: true })
    .webp({ quality: 85 }).toBuffer();
}
