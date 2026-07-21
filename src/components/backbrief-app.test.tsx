import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BackbriefApp } from "./backbrief-app";

describe("Backbrief privacy disclosure", () => {
  it("distinguishes app storage from OpenAI API data handling", () => {
    const html = renderToStaticMarkup(
      <BackbriefApp
        sampleSession={"S".repeat(40)}
        sampleDiff={"D".repeat(40)}
      />,
    );

    expect(html).toContain("Backbrief does not save your evidence");
    expect(html).toContain("OpenAI may retain API content for abuse monitoring");
    expect(html).toContain("NO APP STORAGE");
    expect(html).not.toContain("Nothing is saved");
  });
});
