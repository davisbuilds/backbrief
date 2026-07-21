import { describe, expect, it } from "vitest";

import {
  analyzeRequestSchema,
  coachRequestSchema,
  handoffSchema,
} from "./contracts";

const validAnalysis = {
  sessionText: "A".repeat(40),
  diffText: "B".repeat(40),
  consentToOpenAI: true,
  source: "sample" as const,
};

const validQuestion = {
  id: "q1",
  prompt: "What changed for callers?",
  whyItMatters: "Callers observe the API contract.",
  evidenceRefs: ["D18-D31"],
  teachingPoint: "Accepted is not the same as delivered.",
};

describe("analysis request contract", () => {
  it("accepts bounded evidence with explicit consent", () => {
    expect(analyzeRequestSchema.safeParse(validAnalysis).success).toBe(true);
  });

  it.each([
    ["blank session", { ...validAnalysis, sessionText: "" }],
    ["blank diff", { ...validAnalysis, diffText: "" }],
    ["oversized session", { ...validAnalysis, sessionText: "A".repeat(60_001) }],
    ["oversized diff", { ...validAnalysis, diffText: "B".repeat(60_001) }],
    ["missing consent", { ...validAnalysis, consentToOpenAI: false }],
    ["unknown field", { ...validAnalysis, surprise: true }],
  ])("rejects %s", (_label, input) => {
    expect(analyzeRequestSchema.safeParse(input).success).toBe(false);
  });
});

describe("coach request contract", () => {
  it("accepts one bounded answer for one numbered question", () => {
    const result = coachRequestSchema.safeParse({
      question: validQuestion,
      answer: "The route now acknowledges queued work before delivery.",
      questionNumber: 1,
    });

    expect(result.success).toBe(true);
  });

  it.each([
    ["blank answer", ""],
    ["oversized answer", "A".repeat(4_001)],
  ])("rejects %s", (_label, answer) => {
    const result = coachRequestSchema.safeParse({
      question: validQuestion,
      answer,
      questionNumber: 1,
    });

    expect(result.success).toBe(false);
  });
});

describe("handoff model contract", () => {
  it("requires exactly three questions", () => {
    const base = {
      title: "Retry ownership moved",
      thesis: "The API now acknowledges before delivery.",
      intent: [{ claim: "Keep the API responsive.", refs: ["S2"] }],
      implementation: [{ claim: "Queue the message.", refs: ["D18-D31"] }],
      consequences: [{ claim: "Success semantics changed.", refs: ["D31"] }],
    };

    expect(
      handoffSchema.safeParse({ ...base, questions: [validQuestion] }).success,
    ).toBe(false);
    expect(
      handoffSchema.safeParse({
        ...base,
        questions: [validQuestion, { ...validQuestion, id: "q2" }, { ...validQuestion, id: "q3" }],
      }).success,
    ).toBe(true);
  });
});
