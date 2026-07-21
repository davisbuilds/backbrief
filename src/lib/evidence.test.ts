import { describe, expect, it } from "vitest";

import { numberEvidence } from "./evidence";

describe("evidence numbering", () => {
  it("gives every session line a stable reference", () => {
    expect(numberEvidence("first\nsecond", "S")).toBe(
      "[S1] first\n[S2] second",
    );
  });

  it("normalizes Windows line endings without changing blank-line positions", () => {
    expect(numberEvidence("first\r\n\r\nthird", "D")).toBe(
      "[D1] first\n[D2] \n[D3] third",
    );
  });
});
