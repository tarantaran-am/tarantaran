// Shared by the browser, which prepares photos, and the server, which accepts them.

// Photos are scaled down to this long side and re-encoded, like the old import script did.
export const PHOTO_LONG_SIDE = 2048;
export const PHOTO_QUALITY = 0.82;

// Smaller photos look blurry, so they are refused.
export const MIN_SHORT_SIDE = 800;

// What the file pickers offer. HEIC is how iPhones save photos; the extensions are listed too, since
// Chrome often reports such files with no type at all.
export const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,.heic,.heif";

export type PhotoExtension = "webp" | "jpg";

export const isPhotoExtension = (value: string): value is PhotoExtension => value === "webp" || value === "jpg";
