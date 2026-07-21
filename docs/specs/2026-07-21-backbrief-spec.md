---
date: 2026-07-21
topic: backbrief
stage: spec
status: in-progress
source: conversation
---

# Backbrief Spec

## Problem

Developers who delegate a code change to an AI agent can receive working code
without receiving the mental model needed to maintain, review, or safely own the
change. Existing summaries and review tools focus on the patch itself rather
than the transfer from the original conversation to the resulting behavior.

## Contract

When this ships, a first-time visitor can use supplied sample evidence or their
own session and diff text to complete a grounded handoff that distinguishes
intent, implementation, and unexplained consequences; answer three
consequence-focused questions one at a time; and reach a concise recap, verified
by `pnpm verify` and a successful fresh-browser run of the deployed sample flow.

## Success Criteria

- A visitor can complete the entire sample experience without an account,
  repository clone, API key, or local installation.
- The handoff presents claims about intent, implementation, and unexplained
  consequences with visible references to the supplied evidence.
- Exactly three free-response questions appear sequentially, with grounded
  teaching after each answer and no numeric score, pass/fail label, or merge
  verdict.
- The visitor can restart the experience or switch to bounded custom text input.
- Before custom evidence is transmitted, the interface explains that it will be
  sent to OpenAI and requires explicit acknowledgement.
- Raw session and diff text is not intentionally persisted or written to
  application logs, and model requests opt out of response storage.
- Invalid, oversized, rate-limited, and unavailable-model paths return clear,
  non-sensitive recovery guidance.
- The public repository documents setup, supported browsers, architecture,
  sample data, testing, privacy boundaries, Codex collaboration, and GPT-5.6's
  runtime role.

## Evaluation

The contract is measured by deterministic checks plus the deployed sample flow.

- **Kill:** A fresh visitor cannot reach the recap from the bundled sample, the
  experience requires private credentials, or raw submitted evidence appears in
  application logs.
- **Scale:** After the event, at least five developers complete a real-evidence
  handoff and at least three report that it surfaced a consequence they had not
  already articulated.
- **Graduate:** The public demo remains runnable through judging and at least one
  developer completes the flow with their own session and diff.

## Scope

### In Scope

- A no-login web experience with bundled sample and bounded custom inputs.
- Grounded intent, implementation, consequence, questioning, teaching, and recap
  behaviors.
- Material GPT-5.6 use in the working product.
- Public deployment, repository, documentation, and hackathon submission assets.

### Out of Scope

- Automatic repository access, GitHub authentication, or pull-request comments.
- Full support for every Codex transcript format.
- Accounts, teams, saved history, databases, analytics, or background processing.
- Code review, vulnerability detection, correctness verification, merge gates,
  numeric comprehension scores, or remediation.
- Multiple model providers, mobile applications, IDE extensions, or plugins.

## Assumptions And Constraints

- The public OpenAI dependency may be slow or unavailable; the product must make
  that state visible without fabricating a result or losing the visitor's local
  input.
- Public traffic may be abusive; work and cost must be bounded by input limits,
  output limits, timeouts, and best-effort rate limiting.
- The supplied sample is sanitized, owned by the entrant, and sufficient to show
  the complete value proposition.
- The authenticated Devpost form may contain additional standard fields; a draft
  must be opened early enough to absorb them without changing this contract.
- The build, deployment, public video, and final submission must finish before
  July 21, 2026 at 5:00 PM Pacific.

## Open Questions

None.

## Handoff

1. Hand off to `write-plan` to sequence the build, deployment, verification, and
   submission against this contract.
2. Review contract completeness inline because subagent delegation was not
   authorized for this task.
3. Refine the contract before sequencing if the inline review finds a blocking
   gap.
