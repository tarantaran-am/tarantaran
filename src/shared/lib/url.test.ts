import { describe, expect, it } from "vitest";
import { withQuery } from "./url";

describe("withQuery", () => {
  it("returns the bare path when there is nothing to add", () => {
    expect(withQuery("/catalog", {})).toBe("/catalog");
    expect(withQuery("/catalog", { q: "", page: undefined, marz: null })).toBe("/catalog");
    expect(withQuery("/catalog", new URLSearchParams())).toBe("/catalog");
  });

  it("keeps non-empty values in order", () => {
    expect(withQuery("/catalog", { marz: "lori,shirak", q: "", page: 2 })).toBe("/catalog?marz=lori%2Cshirak&page=2");
  });

  it("accepts URLSearchParams", () => {
    expect(withQuery("/blog", new URLSearchParams({ rubric: "planning" }))).toBe("/blog?rubric=planning");
  });
});
