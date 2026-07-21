---
date: 2026-07-21
status: draft
target-duration: 2m15s
---

# Backbrief Demo Script

Agent-written code can pass its tests before the person inheriting it can explain
what changed. Backbrief closes that gap.

Give it the coding-agent session and the resulting git diff. This built-in sample
is fictional: an agent moved email delivery from an API request into a retrying
queue worker. Backbrief has no accounts or database, and it sends evidence to
OpenAI only after explicit consent.

When I build the Backbrief, GPT-5.6 receives line-numbered session and diff
evidence. Structured Outputs turn that into a grounded handoff with three views:
the requested intent, the actual implementation, and the consequences a human
owner needs to carry. Every claim points back to session or diff lines.

This is deliberately not another approval bot. It does not score the change or
decide whether to merge it. Instead, it asks me to brief the change back, one
question at a time.

Here the first question catches the caller-visible contract: HTTP 202 means the
message was accepted for background work, not delivered. I explain that in my
own words. The coaching names what I saw, adds the missing nuance, and leaves one
memorable takeaway. Two more questions probe the operational failure seam and a
test limitation, then Backbrief produces a recap in my language.

Behind the UI are two stateless OpenAI Responses API calls using GPT-5.6 and
`store: false`. Raw session and diff text go only to the initial analysis;
coaching receives the generated question and the developer's answer. Zod schemas
bound every request and structured response.

I built Backbrief with Codex from a blank directory. Codex helped research the
rules, narrow the idea, write the product spec and API contract, drive red-green
tests, implement the app, run security and browser checks, deploy it, and prepare
this submission. The most valuable choice was a scope cut: no OAuth, database,
scoring, or generic importer—just one real teaching loop.

Backbrief is live, free to try without login, and open source. The agent built it.
Backbrief the change.
