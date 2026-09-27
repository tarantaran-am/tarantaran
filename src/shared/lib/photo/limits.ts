// Shared by the browser, which prepares photos, and the server, which accepts them.

// Photos are scaled down to this long side and re-encoded, like the old import script did.
export const PHOTO_LONG_SIDE = 2048;
export const PHOTO_QUALITY = 0.82;

// Smaller photos look blurry, so they are refused.
export const MIN_SHORT_SIDE = 800;

export type PhotoExtension = "webp" | "jpg";

export const isPhotoExtension = (value: string): value is PhotoExtension => value === "webp" || value === "jpg";
