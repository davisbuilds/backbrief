---
date: 2026-07-21
topic: backbrief
stage: brainstorm
---

# Backbrief

## Problem / Context

Coding agents can finish a change faster than their human operator can build a
mental model of it. A normal diff summary explains what moved, and a code review
looks for defects, but neither reconstructs the relationship between the
operator's intent, the agent's decisions, and the consequences now embedded in
the code. This creates a transfer failure at the end of an otherwise successful
agent session.

## Options Considered

- **Diff quiz:** Small and easy to demonstrate, but existing products already
  generate multiple-choice quizzes from pull-request diffs. It also lacks the
  session evidence needed to explain why the patch exists.
- **AgentMonitor retrospective:** Reuses a mature local product and real session
  telemetry, but only the new extension would be judged and a localhost-first
  application is harder for judges to test without rebuilding.
- **Grounded agent-to-human handoff:** Combine the session and resulting diff to
  map intent to implementation, surface consequences, and teach through a short
  conversation. This is a new, standalone product with a complete public demo
  path and a differentiated evidence model.

## Chosen Direction

Build Backbrief as a stateless web application. A user loads a sanitized sample
or supplies session and diff text, explicitly acknowledges transmission to
OpenAI, and receives a three-part handoff: what was intended, what changed, and
what the session did not explain. Backbrief then asks three free-response
questions one at a time and teaches after each answer. It does not score the
user, approve the patch, or claim the code is correct.

## What Good Looks Like

The experience feels like a careful senior engineer handing work back, not an AI
review dashboard. Evidence remains attached to claims, the questions probe
consequences rather than trivia, and a first-time visitor can understand the
entire product from one polished sample flow.

## Open Questions

- None for the hackathon scope.

## Constraints

- Public, no-login demo and public repository before the July 21 deadline.
- GPT-5.6 is materially present in the working product and Codex builds the
  majority of the implementation in one traceable session.
- No raw-input persistence or logging; bounded payloads and explicit consent.
- No GitHub integration, database, plugin, or generalized transcript importer.

