import { describe, expect, it } from "vitest";

import type { Coaching, Handoff } from "./contracts";
import { buildReceiptHtml, receiptFilename } from "./receipt";

const handoff: Handoff = {
  title: "Queued email delivery",
  thesis: "The request now acknowledges queued work before provider delivery.",
  intent: [{ claim: "Keep the request responsive.", refs: ["S2-S3"] }],
  implementation: [{ claim: "Queue the message ID.", refs: ["D10-D18"] }],
  consequences: [{ claim: "A 202 no longer means delivered.", refs: ["D21-D25"] }],
  questions: [
    {
      id: "q1",
      prompt: "What does 202 mean now?",
      whyItMatters: "Callers own the new contract.",
      evidenceRefs: ["D21-D25"],
      teachingPoint: "Accepted is not delivered.",
    },
    {
      id: "q2",
      prompt: "Who owns retries?",
      whyItMatters: "Operations moved to the worker.",
      evidenceRefs: ["D30-D40"],
      teachingPoint: "The worker owns provider failures.",
    },
    {
      id: "q3",
      prompt: "What remains untested?",
      whyItMatters: "The failure seam needs coverage.",
      evidenceRefs: ["S10-S12"],
      teachingPoint: "Test retry exhaustion.",
    },
  ],
};

const coaching: Coaching[] = [
  { whatYouSaw: "The API returns early.", whatToAdd: "Delivery can still fail.", takeaway: "202 means queued." },
  { whatYouSaw: "The worker retries.", whatToAdd: "Retries need limits.", takeaway: "The worker owns failure." },
  { whatYouSaw: "The happy path is covered.", whatToAdd: "Exercise exhaustion.", takeaway: "Test the operational seam." },
];

describe("Backbrief HTML receipt", () => {
  it("creates a complete self-contained receipt from the finished reverse brief", () => {
    const html = buildReceiptHtml({
      handoff,
      answers: ["It means queued.", "The worker does.", "Retry exhaustion."],
      coaching,
      generatedAt: new Date("2026-07-21T16:00:00.000Z"),
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Queued email delivery");
    expect(html).toContain("Keep the request responsive.");
    expect(html).toContain("S2-S3");
    expect(html).toContain("It means queued.");
    expect(html).toContain("202 means queued.");
    expect(html).toContain("Generated locally");
    expect(html).toContain("@media print");
    expect(html).not.toMatch(/<script|https?:\/\/[^\s"']+\.(?:css|js|woff)/i);
  });

  it("escapes model and developer content before inserting it into the document", () => {
    const html = buildReceiptHtml({
      handoff: { ...handoff, title: '<img src=x onerror="alert(1)">' },
      answers: ["<script>alert(1)</script>", "Safe answer", "Safe answer"],
      coaching,
      generatedAt: new Date("2026-07-21T16:00:00.000Z"),
    });

    expect(html).toContain("&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).not.toContain("<img src=x");
  });

  it("uses a filesystem-safe descriptive filename", () => {
    expect(receiptFilename("Queued email: delivery / retries")).toBe(
      "backbrief-queued-email-delivery-retries.html",
    );
  });
});
