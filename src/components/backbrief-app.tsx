"use client";

import { useMemo, useState } from "react";

import type { Coaching, Handoff } from "../lib/contracts";
import { resolveEvidenceReference, type EvidenceExcerpt } from "../lib/evidence";

type Source = "sample" | "custom";
type Stage = "evidence" | "handoff" | "recap";

type Props = {
  sampleSession: string;
  sampleDiff: string;
};

type EvidenceSources = {
  sessionText: string;
  diffText: string;
};

function claimMarker(kind: "intent" | "implementation" | "consequences") {
  return { intent: "I", implementation: "M", consequences: "C" }[kind];
}

function EvidenceRefs({
  references,
  sources,
  activeReference,
  onSelect,
}: {
  references: string[];
  sources: EvidenceSources;
  activeReference: string | null;
  onSelect: (reference: string) => void;
}) {
  return (
    <div className="refs" aria-label="Evidence references">
      {references.map((reference, index) => {
        const excerpt = resolveEvidenceReference(reference, sources);
        return (
          <button
            className="evidence-ref"
            type="button"
            key={`${reference}-${index}`}
            disabled={!excerpt}
            aria-pressed={activeReference === reference}
            aria-label={excerpt ? `View ${reference} from ${excerpt.sourceLabel}` : `${reference} is unavailable`}
            onClick={() => onSelect(reference)}
          >
            {reference}
          </button>
        );
      })}
    </div>
  );
}

function EvidencePlate({ excerpt, onClose }: { excerpt: EvidenceExcerpt; onClose: () => void }) {
  return (
    <aside className="evidence-plate" role="dialog" aria-labelledby="evidence-plate-heading">
      <div className="evidence-plate-head">
        <div>
          <p>TRACE / {excerpt.reference}</p>
          <h2 id="evidence-plate-heading">Source evidence</h2>
        </div>
        <button type="button" onClick={onClose} aria-label="Close source evidence">CLOSE ×</button>
      </div>
      <div className={`evidence-source-tag source-${excerpt.prefix.toLowerCase()}`}>
        <b>{excerpt.prefix}</b>
        <span>{excerpt.sourceLabel}</span>
        <small>{excerpt.lines.length} {excerpt.lines.length === 1 ? "line" : "lines"}</small>
      </div>
      <ol className="evidence-lines" start={excerpt.lines[0]?.number}>
        {excerpt.lines.map((line) => (
          <li key={line.number} value={line.number}>
            <code>{line.text || " "}</code>
          </li>
        ))}
      </ol>
      <p className="evidence-plate-foot">Exact input · held only in this browser session</p>
    </aside>
  );
}

export function BackbriefApp({ sampleSession, sampleDiff }: Props) {
  const [source, setSource] = useState<Source>("sample");
  const [sessionText, setSessionText] = useState(sampleSession);
  const [diffText, setDiffText] = useState(sampleDiff);
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState<Stage>("evidence");
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [coaching, setCoaching] = useState<Coaching[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeReference, setActiveReference] = useState<string | null>(null);

  const canAnalyze =
    consent && sessionText.trim().length >= 40 && diffText.trim().length >= 40 && !busy;
  const currentQuestion = handoff?.questions[questionIndex];
  const progress = useMemo(() => (questionIndex / 3) * 100, [questionIndex]);
  const evidenceSources = { sessionText, diffText };
  const activeEvidence = activeReference
    ? resolveEvidenceReference(activeReference, evidenceSources)
    : null;

  function chooseSource(next: Source) {
    setSource(next);
    setError("");
    setActiveReference(null);
    if (next === "sample") {
      setSessionText(sampleSession);
      setDiffText(sampleDiff);
    } else {
      setSessionText("");
      setDiffText("");
    }
  }

  async function analyze() {
    if (!canAnalyze) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionText,
          diffText,
          consentToOpenAI: consent,
          source,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Analysis could not start.");
      setHandoff(body.handoff);
      setQuestionIndex(0);
      setAnswers([]);
      setCoaching([]);
      setActiveReference(null);
      setStage("handoff");
      requestAnimationFrame(() => document.querySelector("#handoff")?.scrollIntoView({ behavior: "smooth" }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis could not start.");
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswer() {
    if (!currentQuestion || !answer.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          answer,
          questionNumber: questionIndex + 1,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message || "Coaching is unavailable.");
      setAnswers((current) => [...current, answer.trim()]);
      setCoaching((current) => [...current, body.coaching]);
      setAnswer("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Coaching is unavailable.");
    } finally {
      setBusy(false);
    }
  }

  function continueBrief() {
    if (questionIndex === 2) {
      setStage("recap");
      requestAnimationFrame(() =>
        document.querySelector(".recap")?.scrollIntoView({ behavior: "smooth" }),
      );
    } else {
      setQuestionIndex((current) => current + 1);
    }
  }

  function restart() {
    setStage("evidence");
    setHandoff(null);
    setQuestionIndex(0);
    setAnswers([]);
    setCoaching([]);
    setAnswer("");
    setError("");
    setActiveReference(null);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  return (
    <main>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Backbrief home">
          BACK<span>/</span>BRIEF
        </a>
        <div className="status"><span aria-hidden="true" /> BUILT WITH GPT-5.6</div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">REVERSE BRIEFING FOR AGENT-WRITTEN CODE</p>
        <h1>The agent built it.<br /><em>Can you explain it?</em></h1>
        <p className="lede">
          Paste the coding session and the resulting diff. Backbrief reconstructs the handoff,
          then asks three questions that make the change yours.
        </p>
        <div className="proof-strip" aria-label="How Backbrief works">
          <span><b>01</b> Supply evidence</span>
          <span><b>02</b> Read the handoff</span>
          <span><b>03</b> Brief it back</span>
        </div>
      </section>

      {stage === "evidence" && (
        <section className="workspace" aria-labelledby="evidence-heading">
          <div className="section-heading">
            <div><span className="section-number">01</span><h2 id="evidence-heading">Evidence desk</h2></div>
            <p>Nothing is saved. Your evidence is sent to OpenAI only when you ask for analysis.</p>
          </div>

          <div className="source-switch" aria-label="Evidence source">
            <button className={source === "sample" ? "active" : ""} onClick={() => chooseSource("sample")}>Use the 60-second sample</button>
            <button className={source === "custom" ? "active" : ""} onClick={() => chooseSource("custom")}>Paste my own</button>
          </div>

          <div className="evidence-grid">
            <label className="evidence-panel">
              <span className="panel-label"><b>S</b> AGENT SESSION <small>{sessionText.length.toLocaleString()} chars</small></span>
              <textarea
                value={sessionText}
                onChange={(event) => setSessionText(event.target.value)}
                placeholder="Paste the conversation or agent transcript…"
                spellCheck={false}
              />
            </label>
            <label className="evidence-panel">
              <span className="panel-label"><b>D</b> RESULTING DIFF <small>{diffText.length.toLocaleString()} chars</small></span>
              <textarea
                value={diffText}
                onChange={(event) => setDiffText(event.target.value)}
                placeholder="Paste git diff output…"
                spellCheck={false}
              />
            </label>
          </div>

          <div className="launch-row">
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>I understand these inputs will be sent to OpenAI for analysis.</span>
            </label>
            <button className="primary-button" disabled={!canAnalyze} onClick={analyze}>
              {busy ? "READING THE EVIDENCE…" : "BUILD MY BACKBRIEF →"}
            </button>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
        </section>
      )}

      {stage !== "evidence" && handoff && (
        <section className="handoff" id="handoff" aria-labelledby="handoff-heading">
          <div className="section-heading inverse">
            <div><span className="section-number">02</span><h2 id="handoff-heading">The handoff</h2></div>
            <button className="text-button" onClick={restart}>← NEW EVIDENCE</button>
          </div>
          <div className="thesis">
            <p>CHANGE THESIS</p>
            <h3>{handoff.title}</h3>
            <blockquote>{handoff.thesis}</blockquote>
          </div>
          <div className="claim-grid">
            {(["intent", "implementation", "consequences"] as const).map((kind) => (
              <article key={kind}>
                <div className="claim-title"><b>{claimMarker(kind)}</b><h3>{kind}</h3></div>
                {handoff[kind].map((item, index) => (
                  <div className="claim" key={`${kind}-${index}`}>
                    <p>{item.claim}</p>
                    <EvidenceRefs
                      references={item.refs}
                      sources={evidenceSources}
                      activeReference={activeReference}
                      onSelect={setActiveReference}
                    />
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>
      )}

      {stage === "handoff" && handoff && currentQuestion && (
        <section className="briefing" aria-labelledby="brief-heading">
          <div className="section-heading">
            <div><span className="section-number">03</span><h2 id="brief-heading">Brief it back</h2></div>
            <p>One question at a time. No score, no gate — just a sharper mental model.</p>
          </div>
          <div className="progress" aria-label={`Question ${questionIndex + 1} of 3`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="question-layout">
            <div className="question-index"><span>QUESTION</span><b>0{questionIndex + 1}</b><small>OF 03</small></div>
            <div className="question-body">
              <EvidenceRefs
                references={currentQuestion.evidenceRefs}
                sources={evidenceSources}
                activeReference={activeReference}
                onSelect={setActiveReference}
              />
              <h3>{currentQuestion.prompt}</h3>
              <p className="why">Why it matters: {currentQuestion.whyItMatters}</p>
              {!coaching[questionIndex] ? (
                <>
                  <label htmlFor="answer">YOUR EXPLANATION</label>
                  <textarea id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Explain it in your own words…" />
                  <button className="primary-button" disabled={!answer.trim() || busy} onClick={submitAnswer}>
                    {busy ? "LISTENING…" : "GET COACHING →"}
                  </button>
                </>
              ) : (
                <div className="coaching-note">
                  <p className="coach-label">COACH&apos;S NOTE</p>
                  <dl>
                    <div><dt>What you saw</dt><dd>{coaching[questionIndex].whatYouSaw}</dd></div>
                    <div><dt>One thing to add</dt><dd>{coaching[questionIndex].whatToAdd}</dd></div>
                    <div className="takeaway"><dt>Carry this forward</dt><dd>{coaching[questionIndex].takeaway}</dd></div>
                  </dl>
                  <button className="primary-button" onClick={continueBrief}>
                    {questionIndex === 2 ? "SEE MY RECAP →" : "NEXT QUESTION →"}
                  </button>
                </div>
              )}
              {error && <p className="error" role="alert">{error}</p>}
            </div>
          </div>
        </section>
      )}

      {stage === "recap" && handoff && (
        <section className="recap" aria-labelledby="recap-heading">
          <p className="eyebrow">BACKBRIEF COMPLETE</p>
          <h2 id="recap-heading">You can carry the change now.</h2>
          <p className="recap-lede">Three explanations, three durable takeaways, one change you no longer have to take on faith.</p>
          <div className="recap-list">
            {handoff.questions.map((question, index) => (
              <article key={question.id}>
                <span>0{index + 1}</span>
                <div><h3>{question.prompt}</h3><p className="answer-quote">“{answers[index]}”</p><p>{coaching[index]?.takeaway}</p></div>
              </article>
            ))}
          </div>
          <button className="primary-button light" onClick={restart}>BACKBRIEF ANOTHER CHANGE →</button>
        </section>
      )}

      {activeEvidence && (
        <EvidencePlate excerpt={activeEvidence} onClose={() => setActiveReference(null)} />
      )}

      <footer>
        <span>BACKBRIEF / OPENAI BUILD WEEK 2026</span>
        <span>NO ACCOUNTS · NO STORAGE · NO MERGE GATES</span>
      </footer>
    </main>
  );
}
