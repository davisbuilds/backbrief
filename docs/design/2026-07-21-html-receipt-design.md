---
date: 2026-07-21
topic: html-receipt
stage: brainstorm
---

# Portable HTML Receipt

## Problem / Context

Backbrief currently ends with a useful recap that disappears when the browser
session ends. A developer who has completed the reverse brief should be able to
carry that understanding into a pull request, issue, or team handoff without
creating an account or weakening Backbrief's stateless privacy boundary.

## Options Considered

- **Markdown export:** Portable and easy to paste, but visually loses the
  editorial character that makes the Backbrief feel like a finished handoff.
- **Self-contained HTML receipt:** Preserves hierarchy, typography, evidence
  references, and printability while remaining a local file with no runtime
  dependency. Slightly more implementation work, but the strongest fit.
- **Shareable hosted result:** Convenient for teams, but requires persistence,
  access controls, and a materially larger privacy surface.

## Chosen Direction

Add a recap action that downloads a self-contained HTML receipt generated in
the browser. It contains the change thesis, grouped claims with their evidence
references, the developer's three answers, and the coaching takeaways. It does
not contain the raw session or diff, execute scripts, load remote assets, or
make a network request.

## What Good Looks Like

The receipt feels like the tangible end of the Backbrief ritual: readable in a
browser, useful when printed or attached to another work item, clearly owned by
the developer, and consistent with the product's editorial evidence-desk
design. Download confirmation makes the local-only behavior explicit.

## Open Questions

- None for the hackathon scope.

## Constraints

- Generate and download entirely in the browser.
- Escape all model- and user-supplied content before inserting it into HTML.
- Include evidence references but exclude raw session and diff text.
- Add no storage, account, analytics, or server endpoint.
- Preserve the existing sample, coaching, restart, and mobile flows.
