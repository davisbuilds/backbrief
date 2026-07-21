import { describe, expect, it } from "vitest";

import { resolveEvidenceReference } from "./evidence";

const sources = {
  sessionText: "asked for a queue\nkept the API responsive\nconfirmed no database",
  diffText: "first\r\nsecond\r\nthird\r\nfourth",
};

describe("evidence reference resolution", () => {
  it("resolves a single session line to its exact source text", () => {
    expect(resolveEvidenceReference("S2", sources)).toEqual({
      reference: "S2",
      prefix: "S",
      sourceLabel: "Agent session",
      lines: [{ number: 2, text: "kept the API responsive" }],
    });
  });

  it("resolves inclusive diff ranges with either compact or repeated prefixes", () => {
    expect(resolveEvidenceReference("D2-D4", sources)?.lines).toEqual([
      { number: 2, text: "second" },
      { number: 3, text: "third" },
      { number: 4, text: "fourth" },
    ]);
    expect(resolveEvidenceReference("[D2-4]", sources)?.reference).toBe("D2-4");
  });

  it("rejects malformed, reversed, cross-source, and out-of-bounds references", () => {
    expect(resolveEvidenceReference("look near D2", sources)).toBeNull();
    expect(resolveEvidenceReference("D3-D2", sources)).toBeNull();
    expect(resolveEvidenceReference("S1-D2", sources)).toBeNull();
    expect(resolveEvidenceReference("D2-D9", sources)).toBeNull();
  });
});
