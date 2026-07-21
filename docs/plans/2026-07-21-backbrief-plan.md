---
date: 2026-07-21
topic: backbrief
stage: plan
status: in-progress
source: conversation
---

# Backbrief Plan

## Goal

Deliver the public, no-login Backbrief experience defined by
`docs/specs/2026-07-21-backbrief-spec.md`, including its evidence-grounded GPT-5.6
flow, verification, deployment, repository, and submission assets.

## Scope

### In Scope

- Greenfield Next.js application, domain schemas, two stateless API routes,
  bundled evidence, responsive product UI, tests, deployment, and submission
  documentation.

### Out of Scope

- GitHub integration, persistence, generalized transcript parsing, accounts,
  multiple providers, plugins, merge gates, and numeric scoring.

## Assumptions And Constraints

- The repository is greenfield and has no existing consumers or compatibility
  promises.
- The server has `OPENAI_API_KEY`; browsers never receive it.
- A GPT-5.6 model balances reasoning quality, latency, and public-demo cost; the
  production deployment may select the most reliable event model with
  `OPENAI_MODEL`.
- The public demo must remain testable without rebuilding through the judging
  period.
- Time-box delivery so submission work begins even if optional polish remains.

## Task Breakdown

### Task 1: Establish the executable shell and test harness

**Objective**

Create the minimal framework, commands, shared schemas, sanitized sample, and
behavior-first tests needed by the vertical slice.

**Files**

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `src/lib/contracts.ts`
- Create: `src/lib/sample.ts`
- Test: `src/lib/contracts.test.ts`

**Dependencies**

None

**Implementation Steps**

1. Define pinned project commands and dependencies without optional UI kits.
2. Write failing schema tests for valid, blank, oversized, unknown-field, and
   consent-missing inputs.
3. Add the schemas and sanitized evidence fixture until the tests pass.

**Verification**

- Run: `pnpm test src/lib/contracts.test.ts`
- Expect: the literal contract test file is discovered and all cases pass.

**Test Discovery Verified**

- Runner/discovery evidence: `package.json` routes `pnpm test` to Vitest, whose
  default discovery includes `src/**/*.test.ts`.
- Literal proof: `pnpm test src/lib/contracts.test.ts`.

**Done When**

- Valid inputs parse and invalid or unsafe inputs fail deterministically.
- A sample pair is available without private user data.

### Task 2: Implement the stateless GPT-5.6 boundaries

**Objective**

Deliver grounded analysis and coaching routes with validated model output,
bounded work, stable errors, no raw-input logging, and no response storage.

**Files**

- Create: `src/lib/evidence.ts`
- Create: `src/lib/openai-gateway.ts`
- Create: `src/lib/http.ts`
- Create: `src/lib/rate-limit.ts`
- Create: `src/app/api/analyze/route.ts`
- Create: `src/app/api/coach/route.ts`
- Test: `src/lib/evidence.test.ts`
- Test: `src/app/api/analyze/route.test.ts`
- Test: `src/app/api/coach/route.test.ts`

**Dependencies**

Task 1

**Implementation Steps**

1. Write red tests for stable validation, success, dependency-failure, and
   non-leaking error behavior at the route boundary.
2. Add line-numbered evidence preparation and structured model-output schemas.
3. Implement a private OpenAI service that requests the configured GPT-5.6
   event model with `store: false`, bounded output, and no raw logging.
4. Implement request IDs, best-effort rate limiting, and stable error mapping.

**Verification**

- Run: `pnpm test src/lib/evidence.test.ts src/app/api/analyze/route.test.ts src/app/api/coach/route.test.ts`
- Expect: the literal files run; valid contracts pass and negative paths return
  documented status codes without raw evidence.

**Test Discovery Verified**

- Runner/discovery evidence: Vitest default discovery includes all three literal
  `*.test.ts` files under `src/`.
- Literal proof: the verification command names each test file.

**Done When**

- Both API contracts match `docs/system/API.md` and make bounded, stateless
  GPT-5.6 calls.

### Task 3: Build the complete editorial handoff experience

**Objective**

Create a distinctive, accessible, responsive interface that completes the sample
and custom-input journeys from consent through recap.

**Files**

- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/backbrief-app.tsx`
- Create: `src/components/evidence-input.tsx`
- Create: `src/components/handoff-board.tsx`
- Create: `src/components/coaching-room.tsx`
- Create: `src/components/recap.tsx`

**Dependencies**

Task 2

**Implementation Steps**

1. Establish an editorial proof-sheet visual system using warm paper, ink,
   vermilion, and technical cobalt with characterful serif and mono typography.
2. Implement sample/custom input, visible transmission consent, loading and
   recovery states, and the three-column evidence handoff.
3. Implement exactly three one-at-a-time free-response questions, grounded
   teaching, recap, restart, keyboard navigation, and mobile layout.
4. Keep state local to the active page and avoid third-party client bundles.

**Verification**

- Run: `pnpm lint && pnpm typecheck && pnpm build`
- Expect: zero lint/type errors and a successful production build.

**Done When**

- A first-time visitor can understand and complete the complete flow without
  credentials or setup.
- The result has no score, verdict, or ungrounded review claim.

### Task 4: Verify privacy, behavior, and production runtime

**Objective**

Prove the tested implementation, security posture, live model integration, and
browser experience before public release.

**Files**

- Create: `scripts/live-smoke.mjs`
- Create: `output/playwright/.gitkeep`

**Dependencies**

Task 3

**Implementation Steps**

1. Run lint, types, tests, and production build from a clean state.
2. Run Semgrep and the trifecta audit; address concrete findings in the approved
   application scope.
3. Start the production server, make one live GPT-5.6 sample request, and drive
   the complete browser flow with fresh snapshots and screenshots.
4. Confirm server output contains no raw sample/session/diff content.

**Verification**

- Run: `pnpm verify`
- Expect: lint, typecheck, tests, and build all exit zero.
- Run: `node scripts/live-smoke.mjs`
- Expect: analysis and coaching return schema-valid GPT-5.6 responses.

**Done When**

- Fresh evidence supports the working, private-by-boundary, production-ready
  claims in the contract.

### Task 5: Publish the demo and repository

**Objective**

Make Backbrief freely testable through judging with complete public-source
documentation and a stable production URL.

**Files**

- Create: `.env.example`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `README.md`
- Create: `docs/system/ARCHITECTURE.md`

**Dependencies**

Task 4

**Implementation Steps**

1. Document setup, sample path, supported platforms, architecture, API limits,
   privacy boundaries, testing, prior-art differentiation, Codex collaboration,
   and GPT-5.6's role.
2. Create coherent commits, publish the public GitHub repository, create the
   Vercel project, configure only the server-side API key, and deploy production.
3. Run the same browser flow against production and preserve screenshot evidence.

**Verification**

- Run: `gh repo view davisbuilds/backbrief --web=false`
- Expect: a public repository URL.
- Run: `curl -fsS <production-url>/api/health`
- Expect: a healthy public response.

**Done When**

- Judges have a public repository, documentation, and no-login working demo.

### Task 6: Complete the Devpost submission package

**Objective**

Produce and submit every required artifact before the official deadline.

**Files**

- Create: `docs/submission/DEVPOST.md`
- Create: `docs/submission/DEMO_SCRIPT.md`
- Create: `docs/submission/CHECKLIST.md`

**Dependencies**

Task 5

**Implementation Steps**

1. Open a Devpost draft and capture every authenticated required field.
2. Write concise submission copy and a less-than-three-minute English demo script
   that explicitly covers the product, Codex workflow, and GPT-5.6 runtime role.
3. Record the deployed sample flow, edit and upload a public YouTube video, add
   the primary `/feedback` session ID, and populate every required Devpost field.
4. Recheck the public demo, repository, video, licensing, and final form before
   submitting with at least one hour of deadline margin.

**Verification**

- Run: manual authenticated checklist in `docs/submission/CHECKLIST.md`.
- Expect: every required item has a live URL or captured value and Devpost shows
  the submission as entered before July 21 at 5:00 PM Pacific.

**Done When**

- The hackathon submission is entered, testable, and complete before the cutoff.

## Risks And Mitigations

- Risk: public model latency or outage. Signal: timeout or dependency failure.
  Mitigation: preserve local input, show an honest retry state, and avoid fake
  fallback analysis.
- Risk: API abuse consumes budget. Signal: request-rate spikes. Mitigation:
  bounded payload/output, best-effort per-IP rate limits, and a low fixed number
  of model calls per completed flow.
- Risk: video upload or form fields consume more time than expected. Signal: no
  public video or incomplete draft two hours before target submission.
  Mitigation: open the draft immediately, write the script alongside docs, and
  stop optional polish at the submission-work timebox.
- Risk: input includes secrets or private data. Signal: custom mode selected.
  Mitigation: explicit transmission warning, no persistence/logging, and advice
  to redact before use.

## Verification Matrix

| Requirement | Proof command | Expected signal |
| --- | --- | --- |
| Contract and negative paths | `pnpm test` | All behavior and route tests pass |
| Static correctness | `pnpm lint && pnpm typecheck` | Zero errors |
| Production bundle | `pnpm build` | Next.js production build succeeds |
| Complete local gate | `pnpm verify` | All named gates exit zero |
| Live GPT-5.6 path | `node scripts/live-smoke.mjs` | Schema-valid analysis and coaching |
| Browser experience | Playwright CLI sample flow | Recap reached with no browser errors |
| Public runtime | `curl -fsS <production-url>/api/health` | Healthy public response |
| Submission | Authenticated Devpost checklist | Entered before deadline |

## Handoff

Execute this plan in the current session. Review the seam, negative paths, and
verification matrix inline before coding because subagent delegation was not
authorized.
