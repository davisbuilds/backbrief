export type ApiErrorCode =
  | "invalid_json"
  | "validation_error"
  | "rate_limited"
  | "model_unavailable"
  | "internal_error";

export function createRequestId(): string {
  return `req_${crypto.randomUUID()}`;
}

export function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  retryable: boolean,
  requestId: string,
): Response {
  return Response.json(
    {
      error: {
        code,
        message,
        retryable,
        requestId,
      },
    },
    { status },
  );
}
