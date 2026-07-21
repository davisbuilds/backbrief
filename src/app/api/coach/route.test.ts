import { describe, expect, it, vi } from "vitest";

import type { ModelGateway } from "../../../lib/model-gateway";
import { createCoachHandler } from "./route";

const question = {
  id: "q1" as const,
  prompt: "What changed for callers?",
  whyItMatters: "Callers observe the contract.",
  evidenceRefs: ["D12-D14"],
  teachingPoint: "Accepted is not delivered.",
};

const coaching = {
  whatYouSaw: "You identified the asynchronous boundary.",
  whatToAdd: "The 202 response only confirms queue acceptance.",
  takeaway: "Accepted work may still be lost later.",
};

function gateway(overrides: Partial<ModelGateway> = {}): ModelGateway {
  return {
    analyze: vi.fn(),
    coach: vi.fn().mockResolvedValue(coaching),
    ...overrides,
  };
}

function request(body: unknown): Request {
  return new Request("http://localhost/api/coach", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/coach", () => {
  it("returns grounded teaching without a score or verdict", async () => {
    const coach = vi.fn().mockResolvedValue(coaching);
    const response = await createCoachHandler(gateway({ coach }))(
      request({
        question,
        answer: "Callers get accepted before provider delivery.",
        questionNumber: 1,
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.coaching).toEqual(coaching);
    expect(body).not.toHaveProperty("score");
    expect(JSON.stringify(body)).not.toMatch(/correct|incorrect|pass|fail/i);
    expect(coach).toHaveBeenCalledOnce();
  });

  it("rejects blank answers before model work", async () => {
    const coach = vi.fn();
    const response = await createCoachHandler(gateway({ coach }))(
      request({ question, answer: "", questionNumber: 1 }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("validation_error");
    expect(coach).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limited", async () => {
    const coach = vi.fn();
    const response = await createCoachHandler(gateway({ coach }), () => false)(
      request({ question, answer: "An answer", questionNumber: 1 }),
    );

    expect(response.status).toBe(429);
    expect(coach).not.toHaveBeenCalled();
  });
});
