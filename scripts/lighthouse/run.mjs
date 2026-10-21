import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const baseUrl = process.env.LIGHTHOUSE_URL ?? "http://127.0.0.1:4173";
const timestamp = new Date().toISOString().replaceAll(":", "-");
const reportDirectory = "lighthouse-reports";
const pages = ["/", "/nfts/emerald-ape-042"];

await mkdir(reportDirectory, { recursive: true });
const chrome = await launch({ chromeFlags: ["--headless", "--no-sandbox"] });

try {
  for (const path of pages) {
    const report = await lighthouse(`${baseUrl}${path}`, {
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      port: chrome.port,
      output: "json",
    });
    if (!report)
      throw new Error(`Lighthouse não produziu um relatório para ${path}.`);
    const fileName = `${path === "/" ? "catalog" : "detail"}-${timestamp}.json`;
    await writeFile(join(reportDirectory, fileName), report.report);
  }
} finally {
  await chrome.kill();
}