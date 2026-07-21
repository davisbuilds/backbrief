---
date: 2026-07-21
status: draft
target-duration: 2m30s
narration-model: gpt-4o-mini-tts
narration-voice: marin
narration-style: warm conversational technical founder at about 165 words per minute
---

# Backbrief Demo Script

Agent-written code can pass every test before the developer inheriting it can
explain what changed. Backbrief closes that ownership gap.

It starts with two pieces of evidence: the coding-agent session, and the git diff
that session produced. This built-in example is fictional. An agent moved email
delivery out of an API request and into a retrying queue worker. There are no
accounts and no database, and nothing is sent to OpenAI until I explicitly
consent.

Now I build the Backbrief. GPT-5.6 receives the session and diff with stable line
numbers. Structured Outputs turn that evidence into a handoff with three clear
views: what was intended, what was actually implemented, and which consequences
the human owner now carries.

Most importantly, every claim is auditable. I can select a citation and inspect
the exact original lines, right beside the explanation. I don't have to trust a
confident-sounding summary.

Backbrief is deliberately not another approval bot. It doesn't score the code or
decide whether it should merge. Instead, it asks me to brief the change back, one
question at a time.

The first question catches the caller-visible contract. An H T T P two-oh-two
means the message was accepted for background work; it was not delivered yet. I
explain that in my own words. The coaching reflects what I understood, adds the
missing nuance, and leaves me with one memorable takeaway.

Two more questions probe the operational failure seam and an important test gap.
Then Backbrief gives me a recap in my own language—the change is no longer
something I have to take on faith.

Behind the interface are two stateless OpenAI Responses API calls using GPT-5.6,
with request storage disabled. Raw evidence goes only to the initial analysis.
Coaching sees only the generated question, its teaching point, and my answer.
Zod schemas bound every request and every structured response.

I built Backbrief with Codex from a blank directory. Codex helped research the
rules, narrow the idea, write the product contract, drive red-green tests,
implement the app, run security and browser checks, deploy it, and prepare this
submission.

The best decision was a scope cut: no O-auth, no database, no scoring, and no
generic importer. Just one complete teaching loop.

Backbrief is live, open source, and free to try without a login. The agent built
it. Backbrief the change.
