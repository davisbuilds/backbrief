# API Contract

Backbrief exposes two private-to-the-application HTTP boundaries. Both accept
JSON, perform no durable writes, and return one stable success shape or one
stable error shape. Browser clients are the only intended consumers.

## Shared Constraints

- Content type: `application/json`.
- Maximum session text: 60,000 characters.
- Maximum diff text: 60,000 characters.
- Maximum answer text: 4,000 characters.
- Unknown request fields are rejected.
- Raw evidence and model prompts are never logged.
- OpenAI requests set `store: false` and have bounded output.
- Best-effort anonymous rate limiting is applied before model work.

Errors use:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Session text must be between 40 and 60000 characters.",
    "retryable": false,
    "requestId": "req_..."
  }
}
```

Supported codes are `invalid_json` (400), `validation_error` (422),
`rate_limited` (429), `model_unavailable` (503), and `internal_error` (500).

## POST /api/analyze

Creates a grounded handoff from one session-and-diff pair. Repeating the request
is safe but creates a new paid model response.

Request:

```json
{
  "sessionText": "...",
  "diffText": "...",
  "consentToOpenAI": true,
  "source": "sample"
}
```

`source` is `sample` or `custom`. Consent must be true for both so the live demo
shows the same trust boundary as custom evidence.

Success response:

```json
{
  "handoff": {
    "title": "Retry ownership moved into the queue worker",
    "thesis": "The patch centralizes retry behavior but changes caller-visible timing.",
    "intent": [{ "claim": "...", "refs": ["S4"] }],
    "implementation": [{ "claim": "...", "refs": ["D18-D31"] }],
    "consequences": [{ "claim": "...", "refs": ["S7", "D42-D55"] }],
    "questions": [{
      "id": "q1",
      "prompt": "...",
      "whyItMatters": "...",
      "evidenceRefs": ["D42-D55"],
      "teachingPoint": "..."
    }]
  },
  "meta": {
    "model": "gpt-5.6-terra",
    "requestId": "req_..."
  }
}
```

The model-output schema requires one to three intent, implementation, and
consequence claims and exactly three questions. Reference labels must point to
line-numbered evidence supplied in the prompt.

## POST /api/coach

Evaluates one answer against the compact question evidence returned by the first
request. It does not receive the original raw session or diff.

Request:

```json
{
  "question": {
    "id": "q1",
    "prompt": "...",
    "whyItMatters": "...",
    "evidenceRefs": ["D42-D55"],
    "teachingPoint": "..."
  },
  "answer": "...",
  "questionNumber": 1
}
```

Success response:

```json
{
  "coaching": {
    "whatYouSaw": "...",
    "whatToAdd": "...",
    "takeaway": "..."
  },
  "meta": {
    "model": "gpt-5.6-terra",
    "requestId": "req_..."
  }
}
```

The response teaches from the supplied evidence. It never returns a score,
correct/incorrect verdict, code-quality verdict, or merge recommendation.

