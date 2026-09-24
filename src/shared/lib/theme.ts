export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

// Runs before first paint (inlined in <head>) so the page never flashes the wrong theme.
// Follows the OS setting until the visitor picks a theme explicitly.
export const themeScript = `(() => {
  const key = ${JSON.stringify(THEME_STORAGE_KEY)};
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const stored = () => { try { return localStorage.getItem(key); } catch { return null; } };
  const apply = () => {
    const theme = stored();
    const dark = theme === "dark" || (theme !== "light" && media.matches);
    document.documentElement.classList.toggle("dark", dark);
  };
  apply();
  media.addEventListener("change", apply);
})();`;

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the switch still applies for this page view.
  }

  // Suppress color transitions so the whole page switches in one frame.
  const style = document.createElement("style");
  style.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.appendChild(style);
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.getComputedStyle(document.body);
  requestAnimationFrame(() => style.remove());
}
