import { coachRequestSchema } from "../../../lib/contracts";
import { createRequestId, errorResponse } from "../../../lib/http";
import type { ModelGateway } from "../../../lib/model-gateway";
import { openAIModelGateway } from "../../../lib/openai-gateway";
import { allowModelRequest } from "../../../lib/rate-limit";

type AllowRequest = (request: Request) => boolean;

export function createCoachHandler(
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

    const parsed = coachRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        422,
        "validation_error",
        "Provide a question, answer, and question number.",
        false,
        requestId,
      );
    }

    try {
      const coaching = await gateway.coach(parsed.data);
      return Response.json({ coaching, meta: { requestId } });
    } catch {
      return errorResponse(
        503,
        "model_unavailable",
        "The coaching service is temporarily unavailable.",
        true,
        requestId,
      );
    }
  };
}

export const POST = createCoachHandler();
