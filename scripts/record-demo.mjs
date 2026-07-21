import { mkdir, rename } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";

const outputDir = path.resolve("docs/submission/video-raw");
const outputPath = path.resolve("docs/submission/backbrief-screen.webm");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: {
    dir: outputDir,
    size: { width: 1440, height: 900 },
  },
});

const page = await context.newPage();
await page.goto("https://backbrief.vercel.app", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
await page.getByRole("heading", { name: "The agent built it." }).waitFor();
const video = page.video();

await page.waitForTimeout(7_000);
await page.locator(".workspace").scrollIntoViewIfNeeded();
await page.waitForTimeout(12_000);

await page.getByRole("checkbox", { name: /I understand these inputs/ }).check();
await page.waitForTimeout(2_000);
const analysis = page.waitForResponse(
  (response) => response.url().includes("/api/analyze") && response.status() === 200,
  { timeout: 60_000 },
);
await page.getByRole("button", { name: "BUILD MY BACKBRIEF →" }).click();
await analysis;
await page.locator(".handoff").scrollIntoViewIfNeeded();
await page.waitForTimeout(23_000);

await page.locator(".briefing").scrollIntoViewIfNeeded();
await page.waitForTimeout(9_000);
await page.getByRole("textbox", { name: "YOUR EXPLANATION" }).fill(
  "Callers now receive 202 when the message is queued. The message ID identifies pending work; it does not confirm delivery.",
);
await page.waitForTimeout(7_000);
let coaching = page.waitForResponse(
  (response) => response.url().includes("/api/coach") && response.status() === 200,
  { timeout: 60_000 },
);
await page.getByRole("button", { name: "GET COACHING →" }).click();
await coaching;
await page.waitForTimeout(14_000);

await page.getByRole("button", { name: "NEXT QUESTION →" }).click();
await page.waitForTimeout(4_000);
await page.getByRole("textbox", { name: "YOUR EXPLANATION" }).fill(
  "A failed enqueue can leave an orphaned pending message, so operations need durable recovery such as an outbox.",
);
await page.waitForTimeout(5_000);
coaching = page.waitForResponse(
  (response) => response.url().includes("/api/coach") && response.status() === 200,
  { timeout: 60_000 },
);
await page.getByRole("button", { name: "GET COACHING →" }).click();
await coaching;
await page.waitForTimeout(6_000);

await page.getByRole("button", { name: "NEXT QUESTION →" }).click();
await page.waitForTimeout(4_000);
await page.getByRole("textbox", { name: "YOUR EXPLANATION" }).fill(
  "The evidence does not show the provider-success/database-failure test. A retry test should prove the stable idempotency key prevents duplicate delivery.",
);
await page.waitForTimeout(5_000);
coaching = page.waitForResponse(
  (response) => response.url().includes("/api/coach") && response.status() === 200,
  { timeout: 60_000 },
);
await page.getByRole("button", { name: "GET COACHING →" }).click();
await coaching;
await page.waitForTimeout(6_000);

await page.getByRole("button", { name: "SEE MY RECAP →" }).click();
await page.waitForTimeout(22_000);

await context.close();
await browser.close();

const rawPath = await video.path();
await rename(rawPath, outputPath);
console.log(outputPath);
