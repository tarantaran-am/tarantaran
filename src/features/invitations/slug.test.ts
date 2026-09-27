import { describe, expect, it } from "vitest";
import { slugCandidates, slugFromNames } from "./slug";

describe("slugFromNames", () => {
  it("writes Armenian, Russian and Latin names in Latin letters", () => {
    expect(slugFromNames("Անի", "Արամ")).toBe("ani-aram");
    expect(slugFromNames("Ануш", "Давид")).toBe("anush-david");
    expect(slugFromNames("Lusine", "Tigran")).toBe("lusine-tigran");
    expect(slugFromNames("Գուրգեն", "Լուսինե")).toBe("gurgen-lusine");
  });

  it("keeps multi-word and hyphenated names readable", () => {
    expect(slugFromNames("Мари-Анна", "Ян Ли")).toBe("mari-anna-yan-li");
  });

  it("falls back to 'wedding' for a name with nothing Latin left", () => {
    expect(slugFromNames("’", "Aram")).toBe("wedding-aram");
  });
});

describe("slugCandidates", () => {
  it("tries both orders, then with 'and', then with underscores", () => {
    expect(slugCandidates("Anna", "David")).toEqual([
      "anna-david",
      "david-anna",
      "anna-and-david",
      "david-and-anna",
      "anna_david",
      "david_anna",
      "anna_and_david",
      "david_and_anna",
    ]);
  });

  it("drops repeats when both names are the same", () => {
    expect(slugCandidates("Ani", "Ani")).toEqual(["ani-ani", "ani-and-ani", "ani_ani", "ani_and_ani"]);
  });
});
