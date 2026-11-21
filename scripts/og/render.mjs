// Renders public/og.png (1200 x 630), the social preview card.
// Run with `npm run og` after changing the profile copy or the room art.
import { build } from "esbuild";
import { chromium } from "playwright";
import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../../public/og.png");
const work = await mkdtemp(join(tmpdir(), "og-"));

try {
  await build({ entryPoints: [join(here, "scene.ts")], bundle: true, format: "iife", outfile: join(work, "scene.js") });
  await copyFile(join(here, "card.html"), join(work, "card.html"));

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto(pathToFileURL(join(work, "card.html")).href);
  await page.waitForFunction(() => window.ready === true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type: "png" });
  await browser.close();
  console.log(`wrote ${out}`);
} finally {
  await rm(work, { recursive: true, force: true });
}
