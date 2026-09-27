import { MIN_SHORT_SIDE, PHOTO_LONG_SIDE, PHOTO_QUALITY, type PhotoExtension } from "./limits";

export type PreparedPhoto = { blob: Blob; extension: PhotoExtension };

const HEIC_TYPES = new Set(["image/heic", "image/heif"]);
const isHeic = (file: File) => HEIC_TYPES.has(file.type) || /\.hei[cf]$/i.test(file.name);

// Chrome, Firefox and Android can't open HEIC, the format iPhones save photos in, so those files go
// through libheif. It is about 3 MB and loads only when such a file is picked. The CSP build is the
// one without eval, which the site's Content-Security-Policy would block.
async function openPhoto(file: File): Promise<ImageBitmap> {
  if (!isHeic(file)) return createImageBitmap(file, { imageOrientation: "from-image" });
  const { heicTo } = await import("heic-to/csp");
  return heicTo({ blob: file, type: "bitmap", options: { imageOrientation: "from-image" } });
}

// Scales a photo down in the browser and re-encodes it, so uploads stay small and the phone's
// EXIF rotation is baked in. WebP where the browser can encode it, JPEG otherwise.
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await openPhoto(file);
  } catch {
    throw new Error("Браузер не смог открыть файл. Подойдут JPG, PNG, WebP или HEIC.");
  }

  const { width, height } = bitmap;
  if (Math.min(width, height) < MIN_SHORT_SIDE) {
    bitmap.close();
    throw new Error(`Слишком маленькое фото: ${width}×${height}. Нужно от ${MIN_SHORT_SIDE}px по короткой стороне.`);
  }

  const scale = Math.min(1, PHOTO_LONG_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const webp = await toBlob(canvas, "image/webp");
  // Browsers that can't encode WebP silently return PNG instead.
  if (webp?.type === "image/webp") return { blob: webp, extension: "webp" };
  const jpeg = await toBlob(canvas, "image/jpeg");
  if (!jpeg) throw new Error("Не удалось подготовить фото.");
  return { blob: jpeg, extension: "jpg" };
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, PHOTO_QUALITY));
}

// Sends the file to a signed Storage URL, the same form the Supabase client library uses.
export async function uploadToSignedUrl(uploadUrl: string, blob: Blob): Promise<void> {
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", blob);
  const response = await fetch(uploadUrl, { method: "PUT", body });
  if (!response.ok) throw new Error("Не удалось загрузить файл.");
}
