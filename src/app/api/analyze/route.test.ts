import { describe, expect, it, vi } from "vitest";

import type { Handoff } from "../../../lib/contracts";
import type { ModelGateway } from "../../../lib/model-gateway";
import { ModelUnavailableError } from "../../../lib/model-gateway";
import { createAnalyzeHandler } from "./route";

const handoff: Handoff = {
  title: "Retry ownership moved",
  thesis: "The API acknowledges work before delivery.",
  intent: [{ claim: "Keep requests responsive.", refs: ["S1"] }],
  implementation: [{ claim: "Queue the message.", refs: ["D8-D14"] }],
  consequences: [{ claim: "Success semantics changed.", refs: ["D12-D14"] }],
  questions: [1, 2, 3].map((number) => ({
    id: `q${number}` as "q1" | "q2" | "q3",
    prompt: `Question ${number}`,
    whyItMatters: "The caller owns the contract.",
    evidenceRefs: ["D12-D14"],
    teachingPoint: "Accepted is not delivered.",
  })),
};

function gateway(overrides: Partial<ModelGateway> = {}): ModelGateway {
  return {
    analyze: vi.fn().mockResolvedValue(handoff),
    coach: vi.fn(),
    ...overrides,
  };
}

function request(body: string): Request {
  return new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

const validBody = JSON.stringify({
  sessionText: "S".repeat(40),
  diffText: "D".repeat(40),
  consentToOpenAI: true,
  source: "sample",
});

describe("POST /api/analyze", () => {
  it("returns the grounded handoff and model metadata", async () => {
    const analyze = vi.fn().mockResolvedValue(handoff);
    const response = await createAnalyzeHandler(gateway({ analyze }))(request(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.handoff).toEqual(handoff);
    expect(body.meta.model).toBe("gpt-5.6-terra");
    expect(body.meta.requestId).toMatch(/^req_/);
    expect(analyze).toHaveBeenCalledWith({
      sessionText: "S".repeat(40),
      diffText: "D".repeat(40),
    });
  });

  it("returns a stable 400 error for malformed JSON", async () => {
    const response = await createAnalyzeHandler(gateway())(request("{"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatchObject({ code: "invalid_json", retryable: false });
  });

  it("returns a stable 422 error before model work for invalid evidence", async () => {
    const analyze = vi.fn();
    const response = await createAnalyzeHandler(gateway({ analyze }))(
      request(JSON.stringify({ sessionText: "short" })),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("validation_error");
    expect(analyze).not.toHaveBeenCalled();
  });

  it("returns a stable 429 error before model work when rate limited", async () => {
    const analyze = vi.fn();
    const response = await createAnalyzeHandler(gateway({ analyze }), () => false)(
      request(validBody),
    );

    expect(response.status).toBe(429);
    expect(analyze).not.toHaveBeenCalled();
  });

  it("does not leak evidence or dependency errors", async () => {
    const analyze = vi.fn().mockRejectedValue(
      new ModelUnavailableError(),
    );
    const secret = "PRIVATE_SESSION_VALUE";
    const response = await createAnalyzeHandler(gateway({ analyze }))(
      request(
        JSON.stringify({
          sessionText: secret.repeat(3),
          diffText: "D".repeat(40),
          consentToOpenAI: true,
          source: "custom",
        }),
      ),
    );
    const serialized = JSON.stringify(await response.json());

    expect(response.status).toBe(503);
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain("Model dependency unavailable");
  });
});
