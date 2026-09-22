import { Manrope, Playfair_Display, Noto_Sans_Armenian, Noto_Serif_Armenian } from "next/font/google";

const sans = Manrope({
  variable: "--font-sans-base",
  subsets: ["latin", "cyrillic"],
});

const sansArmenian = Noto_Sans_Armenian({
  variable: "--font-sans-armenian",
  subsets: ["armenian"],
});

const serif = Playfair_Display({
  variable: "--font-serif-base",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
});

const serifArmenian = Noto_Serif_Armenian({
  variable: "--font-serif-armenian",
  subsets: ["armenian"],
});

export const fontVariables = [sans.variable, sansArmenian.variable, serif.variable, serifArmenian.variable].join(" ");
