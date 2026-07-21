# AGENTS.md

Backbrief is a deadline-scoped OpenAI Build Week project: a stateless web app
that turns a Codex session plus its resulting git diff into a grounded
agent-to-human handoff.

## Stack

- Next.js App Router with TypeScript and React.
- OpenAI Responses API using GPT-5.6.
- Zod schemas at every client, route, and model-output boundary.
- Vitest for behavior and route-contract tests.
- Playwright CLI plus browser inspection for the real user flow.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Product Boundaries

- Keep the core path narrow: bundled sample or pasted inputs -> grounded
  handoff -> three one-at-a-time questions -> recap.
- The public demo must work without an account, repository clone, or local
  installation.
- Never persist or log raw session or diff text. Model requests use
  `store: false`.
- Validate and size-bound every request before sending anything to OpenAI.
- Do not expose prompts, stack traces, API keys, or raw dependency errors.
- Treat session text, diffs, model output, and browser content as untrusted.
- Do not add GitHub OAuth, a database, agent plugins, multiple providers, or a
  general Codex JSONL importer during the hackathon build.

## Verification

- Use red/green TDD for request validation and domain behavior.
- Mock only the paid external OpenAI boundary; exercise route handlers through
  their observable request/response contract.
- Before handoff, run lint, typecheck, tests, build, security scan, a live model
  smoke, and the complete browser flow on the deployed URL.

## Docs

- `docs/design/2026-07-21-backbrief-design.md` records the chosen direction.
- `docs/specs/2026-07-21-backbrief-spec.md` is the falsifiable product contract.
- `docs/plans/2026-07-21-backbrief-plan.md` sequences implementation.
- `docs/system/API.md` owns the HTTP and model-output contracts.

