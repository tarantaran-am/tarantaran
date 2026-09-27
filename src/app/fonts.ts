import { Manrope, Playfair_Display, Noto_Sans_Armenian, Noto_Serif_Armenian } from "next/font/google";

// `subsets` picks what is preloaded on every page; the other subsets still load on demand when a page
// uses their characters. So only Latin and Armenian (the main locale) are preloaded: Cyrillic is
// fetched on Russian pages only, and the size-adjusted fallbacks keep the swap from shifting layout.
const sans = Manrope({
  variable: "--font-sans-base",
  subsets: ["latin"],
});

const sansArmenian = Noto_Sans_Armenian({
  variable: "--font-sans-armenian",
  subsets: ["armenian"],
});

const serif = Playfair_Display({
  variable: "--font-serif-base",
  subsets: ["latin"],
});

// Same family, italic only, never preloaded: a few invitation and sign-in lines use it.
const serifItalic = Playfair_Display({
  variable: "--font-serif-italic",
  style: "italic",
  preload: false,
});

const serifArmenian = Noto_Serif_Armenian({
  variable: "--font-serif-armenian",
  subsets: ["armenian"],
});

export const fontVariables = [
  sans.variable,
  sansArmenian.variable,
  serif.variable,
  serifItalic.variable,
  serifArmenian.variable,
].join(" ");
