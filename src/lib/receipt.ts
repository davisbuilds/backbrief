import type { Coaching, Handoff } from "./contracts";

export type ReceiptInput = {
  handoff: Handoff;
  answers: string[];
  coaching: Coaching[];
  generatedAt: Date;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character] ?? character,
  );
}

function evidenceGroup(
  label: string,
  marker: string,
  claims: Handoff["intent"],
): string {
  const items = claims
    .map(
      ({ claim, refs }) => `
        <li>
          <p>${escapeHtml(claim)}</p>
          <div class="refs">${refs.map((reference) => `<span>${escapeHtml(reference)}</span>`).join("")}</div>
        </li>`,
    )
    .join("");

  return `
    <section class="evidence-group">
      <header><b>${marker}</b><h3>${label}</h3></header>
      <ul>${items}</ul>
    </section>`;
}

export function buildReceiptHtml({ handoff, answers, coaching, generatedAt }: ReceiptInput): string {
  const generatedLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(generatedAt);
  const briefItems = handoff.questions
    .map((question, index) => {
      const answer = answers[index] ?? "No answer recorded.";
      const note = coaching[index];

      return `
        <article class="brief-item">
          <div class="brief-number">0${index + 1}</div>
          <div>
            <div class="question-head">
              <h3>${escapeHtml(question.prompt)}</h3>
              <div class="refs">${question.evidenceRefs.map((reference) => `<span>${escapeHtml(reference)}</span>`).join("")}</div>
            </div>
            <p class="answer"><small>MY EXPLANATION</small>&ldquo;${escapeHtml(answer)}&rdquo;</p>
            ${
              note
                ? `<div class="coach-note">
                    <p><small>WHAT I SAW</small>${escapeHtml(note.whatYouSaw)}</p>
                    <p><small>ONE THING TO ADD</small>${escapeHtml(note.whatToAdd)}</p>
                    <p class="takeaway"><small>CARRY THIS FORWARD</small>${escapeHtml(note.takeaway)}</p>
                  </div>`
                : ""
            }
          </div>
        </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <link rel="icon" href="data:,">
  <title>Backbrief receipt — ${escapeHtml(handoff.title)}</title>
  <style>
    :root { --paper:#f2ecdf; --bright:#fffaf0; --ink:#181713; --red:#df422d; --blue:#2348c7; --line:#aaa292; --muted:#6d675d; }
    * { box-sizing:border-box; }
    html { background:var(--paper); color:var(--ink); font-family:"Courier New", Courier, monospace; }
    body { margin:0; }
    main { width:min(1120px, calc(100% - 40px)); margin:0 auto; }
    .masthead { display:flex; justify-content:space-between; align-items:center; padding:24px 0; border-bottom:1px solid var(--ink); font-size:12px; letter-spacing:.08em; }
    .wordmark { font-weight:700; font-size:20px; letter-spacing:-.07em; }
    .wordmark i { color:var(--red); font-style:normal; }
    .local { display:flex; align-items:center; gap:9px; }
    .local::before { content:""; width:8px; height:8px; border-radius:50%; background:#2b9b58; box-shadow:0 0 0 3px rgba(43,155,88,.17); }
    .hero { padding:88px 0 74px; border-bottom:1px solid var(--ink); }
    .eyebrow, small { display:block; color:var(--red); font-size:10px; font-weight:700; letter-spacing:.13em; }
    h1 { max-width:900px; margin:24px 0 18px; font-family:Georgia,"Times New Roman",serif; font-size:clamp(52px,8vw,104px); font-weight:400; letter-spacing:-.055em; line-height:.88; }
    .thesis { max-width:850px; margin:0; color:var(--muted); font-family:Georgia,"Times New Roman",serif; font-size:clamp(22px,2.8vw,32px); line-height:1.35; }
    .receipt-meta { display:flex; flex-wrap:wrap; gap:12px 28px; margin-top:42px; font-size:11px; }
    .receipt-meta b { color:var(--blue); }
    .section-title { display:flex; align-items:baseline; gap:18px; padding:56px 0 28px; }
    .section-title span { color:var(--red); font-size:11px; font-weight:700; }
    .section-title h2 { margin:0; font-family:Georgia,"Times New Roman",serif; font-size:48px; font-weight:400; letter-spacing:-.04em; }
    .evidence-grid { display:grid; grid-template-columns:repeat(3,1fr); border:1px solid var(--ink); background:var(--bright); }
    .evidence-group { min-width:0; padding:26px; }
    .evidence-group + .evidence-group { border-left:1px solid var(--ink); }
    .evidence-group header { display:flex; align-items:center; gap:12px; padding-bottom:22px; }
    .evidence-group header b { display:grid; place-items:center; width:28px; height:28px; background:var(--blue); color:white; }
    .evidence-group:nth-child(2) header b { background:var(--red); }
    .evidence-group:nth-child(3) header b { background:#cfb932; color:var(--ink); }
    .evidence-group h3 { margin:0; font-size:11px; letter-spacing:.1em; text-transform:uppercase; }
    ul { margin:0; padding:0; list-style:none; }
    li { padding:18px 0; border-top:1px solid var(--line); }
    li p { margin:0 0 14px; font-family:Georgia,"Times New Roman",serif; font-size:19px; line-height:1.3; }
    .refs { display:flex; flex-wrap:wrap; gap:6px; }
    .refs span { border:1px solid currentColor; border-radius:999px; color:var(--blue); padding:4px 8px; font-size:9px; letter-spacing:.07em; }
    .brief-list { border-top:1px solid var(--ink); margin-bottom:76px; }
    .brief-item { display:grid; grid-template-columns:90px 1fr; gap:28px; padding:34px 0; border-bottom:1px solid var(--ink); break-inside:avoid; }
    .brief-number { color:var(--red); font-family:Georgia,"Times New Roman",serif; font-size:52px; line-height:1; }
    .question-head { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; }
    .question-head h3 { max-width:720px; margin:0; font-family:Georgia,"Times New Roman",serif; font-size:28px; font-weight:400; line-height:1.1; }
    .answer { margin:24px 0; padding-left:18px; border-left:3px solid var(--blue); font-family:Georgia,"Times New Roman",serif; font-size:21px; line-height:1.45; }
    .answer small, .coach-note small { margin-bottom:8px; font-family:"Courier New",Courier,monospace; font-style:normal; }
    .coach-note { display:grid; grid-template-columns:1fr 1fr 1.15fr; border:1px solid var(--ink); background:var(--bright); }
    .coach-note p { margin:0; padding:18px; font-family:Georgia,"Times New Roman",serif; font-size:17px; line-height:1.4; }
    .coach-note p + p { border-left:1px solid var(--line); }
    .coach-note .takeaway { background:var(--blue); color:white; }
    .coach-note .takeaway small { color:#ffd7cc; }
    footer { display:flex; justify-content:space-between; gap:20px; padding:24px 0 36px; border-top:1px solid var(--ink); color:var(--muted); font-size:9px; letter-spacing:.08em; }
    @media (max-width:760px) {
      main { width:min(100% - 24px,1120px); }
      .masthead, .question-head, footer { align-items:flex-start; flex-direction:column; }
      .hero { padding:54px 0; }
      .evidence-grid, .coach-note { grid-template-columns:1fr; }
      .evidence-group + .evidence-group, .coach-note p + p { border-left:0; border-top:1px solid var(--ink); }
      .brief-item { grid-template-columns:1fr; }
    }
    @media print {
      @page { margin:14mm; }
      html { background:white; }
      main { width:100%; }
      .hero { padding:30px 0; }
      h1 { font-size:58px; }
      .section-title { padding-top:30px; }
      .evidence-grid { grid-template-columns:repeat(3,1fr); }
      .evidence-group { padding:16px; }
      .brief-list { margin-bottom:30px; }
      footer { padding-bottom:0; }
    }
  </style>
</head>
<body>
  <main>
    <header class="masthead">
      <div class="wordmark">BACK<i>/</i>BRIEF</div>
      <div class="local">Generated locally · ready to print</div>
    </header>

    <section class="hero">
      <p class="eyebrow">AGENT-TO-HUMAN HANDOFF / COMPLETE</p>
      <h1>${escapeHtml(handoff.title)}</h1>
      <p class="thesis">${escapeHtml(handoff.thesis)}</p>
      <div class="receipt-meta">
        <span><b>03</b> questions briefed back</span>
        <span><b>${escapeHtml(generatedLabel)}</b> generated</span>
        <span>Evidence references included · raw source evidence excluded</span>
      </div>
    </section>

    <div class="section-title"><span>01</span><h2>The handoff</h2></div>
    <div class="evidence-grid">
      ${evidenceGroup("Intent", "I", handoff.intent)}
      ${evidenceGroup("Implementation", "M", handoff.implementation)}
      ${evidenceGroup("Consequences", "C", handoff.consequences)}
    </div>

    <div class="section-title"><span>02</span><h2>The reverse brief</h2></div>
    <section class="brief-list">${briefItems}</section>

    <footer>
      <span>BACKBRIEF / THE AGENT BUILT IT. YOU CAN EXPLAIN IT.</span>
      <span>LOCAL FILE · NO RAW EVIDENCE · NO REMOTE ASSETS</span>
    </footer>
  </main>
</body>
</html>`;
}

export function receiptFilename(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64)
    .replace(/-$/g, "");

  return `backbrief${slug ? `-${slug}` : ""}.html`;
}
