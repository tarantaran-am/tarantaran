export const PHOTO_PLACEHOLDER = "/placeholder-photo.svg";

export function photoOrPlaceholder(url: unknown): string {
  return url && typeof url === "string" ? url : PHOTO_PLACEHOLDER;
}
