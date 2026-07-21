export function numberEvidence(text: string, prefix: "S" | "D"): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line, index) => `[${prefix}${index + 1}] ${line}`)
    .join("\n");
}

export type EvidenceExcerpt = {
  reference: string;
  prefix: "S" | "D";
  sourceLabel: "Agent session" | "Resulting diff";
  lines: Array<{ number: number; text: string }>;
};

export function resolveEvidenceReference(
  reference: string,
  sources: { sessionText: string; diffText: string },
): EvidenceExcerpt | null {
  const normalizedReference = reference.trim().replace(/^\[|\]$/g, "");
  const match = /^([SD])(\d+)(?:-([SD])?(\d+))?$/.exec(normalizedReference);

  if (!match) return null;

  const prefix = match[1] as "S" | "D";
  const [, , startValue, repeatedPrefix, endValue] = match;
  if (repeatedPrefix && repeatedPrefix !== prefix) return null;

  const start = Number(startValue);
  const end = Number(endValue ?? startValue);
  if (start < 1 || end < start) return null;

  const sourceText = prefix === "S" ? sources.sessionText : sources.diffText;
  const sourceLines = sourceText.replace(/\r\n?/g, "\n").split("\n");
  if (end > sourceLines.length) return null;

  return {
    reference: normalizedReference,
    prefix,
    sourceLabel: prefix === "S" ? "Agent session" : "Resulting diff",
    lines: sourceLines.slice(start - 1, end).map((text, index) => ({
      number: start + index,
      text,
    })),
  };
}
