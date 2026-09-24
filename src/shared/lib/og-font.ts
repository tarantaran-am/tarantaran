import "server-only";

type FontWeight = 400 | 500 | 600 | 700;

// Fetches a Google font subset to just `text`. ImageResponse can't read woff2, and without a
// browser User-Agent Google Fonts serves TrueType, which it can.
export async function loadGoogleFont(family: string, weight: FontWeight, text: string): Promise<ArrayBuffer> {
  const params = new URLSearchParams({ family: `${family}:wght@${weight}`, text });
  const css = await fetch(`https://fonts.googleapis.com/css2?${params}`).then((res) => res.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`Google Fonts returned no TrueType file for ${family}`);

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${family}: ${response.status}`);
  return response.arrayBuffer();
}
