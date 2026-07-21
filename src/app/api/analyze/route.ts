import { analyzeRequestSchema } from "../../../lib/contracts";
import { createRequestId, errorResponse } from "../../../lib/http";
import type { ModelGateway } from "../../../lib/model-gateway";
import { DEFAULT_MODEL } from "../../../lib/model-gateway";
import { openAIModelGateway } from "../../../lib/openai-gateway";
import { allowModelRequest } from "../../../lib/rate-limit";

type AllowRequest = (request: Request) => boolean;

export function createAnalyzeHandler(
  gateway: ModelGateway = openAIModelGateway,
  allowRequest: AllowRequest = allowModelRequest,
) {
  return async function POST(request: Request): Promise<Response> {
    const requestId = createRequestId();

    if (!allowRequest(request)) {
      return errorResponse(
        429,
        "rate_limited",
        "Too many requests. Try again shortly.",
        true,
        requestId,
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(
        400,
        "invalid_json",
        "The request body must be valid JSON.",
        false,
        requestId,
      );
    }

    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        422,
        "validation_error",
        "Provide a session, a diff, and explicit consent.",
        false,
        requestId,
      );
    }

    try {
      const handoff = await gateway.analyze({
        sessionText: parsed.data.sessionText,
        diffText: parsed.data.diffText,
      });
      return Response.json({
        handoff,
        meta: { model: process.env.OPENAI_MODEL || DEFAULT_MODEL, requestId },
      });
    } catch {
      return errorResponse(
        503,
        "model_unavailable",
        "The analysis service is temporarily unavailable.",
        true,
        requestId,
      );
    }
  };
}

export const POST = createAnalyzeHandler();
