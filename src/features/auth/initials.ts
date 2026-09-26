// Two letters for the avatar: first and last name, or the start of the email without a name.
export function initials(name: string | null, email: string): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words.at(-1)] : [words[0] ?? email];
  return letters
    .map((word) => Array.from(word ?? "")[0] ?? "")
    .join("")
    .toLocaleUpperCase();
}
