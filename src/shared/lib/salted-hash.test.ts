import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/env", () => ({ env: { VISITOR_HASH_SALT: "salt" } }));

const { saltedHash } = await import("./salted-hash");

describe("saltedHash", () => {
  it("hashes the salt and the parts joined with |, as the stored hashes were made", () => {
    const expected = createHash("sha256").update("salt|2026-09-26|1.2.3.4|UA").digest("hex");
    expect(saltedHash("2026-09-26", "1.2.3.4", "UA")).toBe(expected);
  });
});
