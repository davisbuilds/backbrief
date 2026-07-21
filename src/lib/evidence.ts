export function numberEvidence(text: string, prefix: "S" | "D"): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line, index) => `[${prefix}${index + 1}] ${line}`)
    .join("\n");
}
