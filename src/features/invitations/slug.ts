// The address of a published invitation, /i/ani-aram: the two names in Latin letters.

const ARMENIAN: Record<string, string> = {
  ա: "a",
  բ: "b",
  գ: "g",
  դ: "d",
  ե: "e",
  զ: "z",
  է: "e",
  ը: "y",
  թ: "t",
  ժ: "zh",
  ի: "i",
  լ: "l",
  խ: "kh",
  ծ: "ts",
  կ: "k",
  հ: "h",
  ձ: "dz",
  ղ: "gh",
  ճ: "ch",
  մ: "m",
  յ: "y",
  ն: "n",
  շ: "sh",
  ո: "o",
  չ: "ch",
  պ: "p",
  ջ: "j",
  ռ: "r",
  ս: "s",
  վ: "v",
  տ: "t",
  ր: "r",
  ց: "ts",
  ւ: "v",
  փ: "p",
  ք: "k",
  և: "ev",
  օ: "o",
  ֆ: "f",
};

const CYRILLIC: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

// A name in Latin letters, at most 40 of them, words joined by hyphens.
function latin(name: string): string {
  const lower = name.toLocaleLowerCase().replace(/ու/g, "u");
  const letters = Array.from(lower, (char) => ARMENIAN[char] ?? CYRILLIC[char] ?? char).join("");
  return letters
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

// The addresses to try, best first: the names in either order, then with "and", then the same with
// underscores. Eight ways for two couples with the same names to both get a clean address.
export function slugCandidates(partnerOne: string, partnerTwo: string): string[] {
  const one = latin(partnerOne) || "wedding";
  const two = latin(partnerTwo) || "wedding";
  const orders = [
    [one, two],
    [two, one],
    [one, "and", two],
    [two, "and", one],
  ];
  const candidates = ["-", "_"].flatMap((separator) => orders.map((parts) => parts.join(separator)));
  return [...new Set(candidates)];
}

// The address the builder shows before publishing: the first candidate.
export function slugFromNames(partnerOne: string, partnerTwo: string): string {
  return slugCandidates(partnerOne, partnerTwo)[0]!;
}
