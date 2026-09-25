// Shared by the browser, which prepares photos, and the server, which accepts them.

export const MAX_PHOTOS = 30;

// Photos are scaled down to this long side and re-encoded, like the old import script did.
export const PHOTO_LONG_SIDE = 2048;
export const PHOTO_QUALITY = 0.82;

// Smaller photos look blurry in the gallery, so they are refused.
export const MIN_SHORT_SIDE = 800;

export type PhotoExtension = "webp" | "jpg";
