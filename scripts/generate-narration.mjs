import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import OpenAI from "openai";

const scriptPath = path.resolve("docs/submission/demo-script.md");
const outputPath = path.resolve("docs/submission/backbrief-narration-openai.wav");
const heading = "# Backbrief Demo Script";

const markdown = await readFile(scriptPath, "utf8");
const headingIndex = markdown.indexOf(heading);
if (headingIndex === -1) throw new Error(`Missing ${heading} in ${scriptPath}`);

const input = markdown.slice(headingIndex + heading.length).trim();
if (!input || input.length > 4_096) {
  throw new Error(`Narration must contain between 1 and 4096 characters; received ${input.length}.`);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const speech = await client.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "marin",
  input,
  instructions:
    "Speak like a warm, conversational technical founder presenting a product they built. Keep the delivery natural, precise, and understated at about 165 words per minute. Avoid an announcer voice. Use brief pauses between paragraphs and give technical terms clear, unforced emphasis.",
  response_format: "wav",
});

await writeFile(outputPath, Buffer.from(await speech.arrayBuffer()));
console.log(outputPath);
