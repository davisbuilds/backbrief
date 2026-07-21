---
date: 2026-07-21
status: draft
track: Developer Tools
---

# Devpost Copy

## Project name

Backbrief

## Elevator pitch

The agent built it. Backbrief the change.

## Short description

Backbrief turns a coding-agent session and resulting diff into an evidence-cited
handoff, then asks the developer three free-response questions that make the
change theirs. It teaches intent, mechanism, and consequences without scoring,
approving, or blocking a merge.

## Inspiration

Coding agents can produce a working change faster than a developer can form a
durable mental model of it. Existing review tools mostly ask whether generated
code is good. We wanted to ask a more human ownership question: can the person
inheriting the change explain what the agent intended, what it actually changed,
and which consequences they now own?

## What it does

Backbrief accepts two artifacts: the agent session and the resulting git diff.
GPT-5.6 turns them into a grounded handoff with separate intent,
implementation, and consequences columns, each citing stable session or diff
line references. It then runs a three-question reverse brief, one question at a
time. The developer answers in their own words, receives concise teaching, and
finishes with a recap they can carry forward.

Every evidence reference is interactive. Selecting it opens the exact original
session or diff lines in an audit plate without leaving the handoff.

The public app includes a fictional email-queue example, so judges can complete
the full flow without an account, repository, API key, or local installation.

## How we built it

Backbrief is a Next.js and TypeScript app using two stateless OpenAI Responses
API calls with GPT-5.6. Zod Structured Outputs constrain the initial handoff and
each coaching note. The server adds stable `S1…Sn` and `D1…Dn` references before
analysis, validates and size-bounds every boundary, requests `store: false`, and
returns generic errors that never echo private evidence.

The raw session and diff are used only for initial analysis. The coaching call
receives only the generated question, teaching point, and developer answer.
There is no database, account system, analytics, or raw-input logging.

Codex was the primary development partner from blank repo to production. It
helped research the rules and adjacent projects, narrow the product, write a
falsifiable spec and API contract, drive red-green tests, implement the GPT and
UI layers, run live-model and browser verification, scan the code, deploy the
app, and package the submission.

## Challenges

The hard problem was grounding without pretending to verify. Session text can
state intent that the diff does not implement, while a diff can expose behavior
the session never discussed. Stable evidence references and a strict structured
schema let the model preserve that tension instead of collapsing it into a
generic summary.

The second challenge was privacy and scope. Agent transcripts may contain
sensitive context, so Backbrief explicitly gates model use, avoids persistence
and logging, bounds inputs, and keeps raw evidence out of the coaching call.

## Accomplishments

- A complete no-login teaching loop powered by real GPT-5.6 calls.
- Auditable evidence-cited handoffs with exact source lines one click away.
- Free-response coaching without scores, correctness labels, or merge verdicts.
- Twenty-four passing behavioral tests plus lint, typecheck, and production build.
- Zero Semgrep findings and no detected lethal-trifecta co-location.
- Verified desktop and mobile flows on the production deployment.

## What we learned

The most useful AI coding workflow is not more autonomy by default. It is a
clear contract, observable evidence, and a human loop at the exact point where
ownership changes hands. We also learned that a strong hackathon product often
comes from removing adjacent features: OAuth, persistence, provider-specific
importers, and scoring would all have weakened the core demo.

## What's next

The next step is to measure whether developers actually complete all three
questions and can explain the change later. Only then would we add direct Codex
session import, repository-aware evidence selection, or team handoff exports.
Backbrief will remain educational and non-gating.

## Links

- Live app: https://backbrief.vercel.app
- Source: https://github.com/davisbuilds/backbrief

## Testing instructions

1. Open the live app; no login is required.
2. Keep **Use the 60-second sample** selected.
3. Check the OpenAI consent box and click **Build my Backbrief**.
4. Read the evidence-cited handoff and select any `S…` or `D…` citation to inspect
   its exact source lines.
5. Answer each of the three questions in a sentence or two and continue to the
   recap.

Expected completion time: about 2 minutes.

## Supported platforms

The primary judge path is the public web app in a current desktop or mobile
browser. It has been exercised in Safari and Chromium at desktop and mobile
viewport sizes. No extension, plugin, or local installation is required.

## OpenAI feedback Session ID

`019f84cc-479f-7950-a42b-0c8bdd61ba7b`

## Demo narration

The demo uses an AI-generated voice created with the OpenAI Speech API.
