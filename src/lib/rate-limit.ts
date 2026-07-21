const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 12;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function requestKey(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export function allowModelRequest(request: Request): boolean {
  const now = Date.now();
  const key = requestKey(request);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= REQUESTS_PER_WINDOW) return false;

  current.count += 1;
  return true;
}
