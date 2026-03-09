const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { chromium } = require("playwright");

const APP_URL = "https://rzd.redmaxx.com.br";
const BUNDLE_PATH = path.resolve(__dirname, "../tmp/rzd/index-Do3rabUS.js");
const STORAGE_STATE = process.env.RZD_STORAGE_STATE
  ? path.resolve(process.env.RZD_STORAGE_STATE)
  : path.resolve(
      __dirname,
      "rzd_authenticated_audit/run-1773019669276/storageState.json"
    );
const RUN_ID = `run-${Date.now()}`;
const OUT_DIR = path.resolve(__dirname, "rzd_chord_recheck", RUN_ID);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readBundle(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Bundle não encontrado: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function loadChordCore(bundleSource) {
  const start = bundleSource.indexOf("const aJ=[");
  const end = bundleSource.indexOf("const Nu=fJ();");
  if (start < 0 || end < 0) {
    throw new Error("Núcleo musical não encontrado no bundle.");
  }
  const script = `${bundleSource.slice(
    start,
    end
  )}const Nu=fJ(); module.exports={Nu};`;
  const ctx = {
    module: { exports: {} },
    exports: {},
    console: { log: () => {}, warn: () => {}, error: () => {} },
    Date,
    Math,
    Set,
    Map,
    JSON,
  };
  vm.createContext(ctx);
  vm.runInContext(script, ctx, { timeout: 10000 });
  return ctx.module.exports;
}

function chordSlug(root, suffix) {
  return `${root}${suffix}`.replace(/\//g, "-");
}

async function closeOnboardingIfVisible(page) {
  const candidates = [
    page.getByRole("button", { name: /Pular tour/i }),
    page.getByRole("button", { name: /^✕$/ }),
    page.locator("button").filter({ hasText: /Pular tour/i }),
  ];
  for (const locator of candidates) {
    try {
      if ((await locator.count()) > 0) {
        await locator.first().click({ timeout: 1200 });
        await page.waitForTimeout(120);
      }
    } catch (_err) {}
  }
}

async function main() {
  if (!fs.existsSync(STORAGE_STATE)) {
    throw new Error(`Storage state não encontrado: ${STORAGE_STATE}`);
  }

  ensureDir(OUT_DIR);
  const bundle = readBundle(BUNDLE_PATH);
  const core = loadChordCore(bundle);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    storageState: STORAGE_STATE,
  });
  const page = await context.newPage();
  const results = [];

  for (const chord of core.Nu.chords) {
    const slug = chordSlug(chord.root, chord.suffix);
    const route = `/chord/${encodeURIComponent(slug)}`;
    const consoleErrors = [];
    const pageErrors = [];

    const onConsole = (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    };
    const onPageError = (err) => pageErrors.push(String(err));
    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    let status = null;
    try {
      const res = await page.goto(new URL(route, APP_URL).toString(), {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      status = res ? res.status() : null;
    } catch (err) {
      consoleErrors.push(`goto-failed: ${err.message}`);
    }

    await page.waitForTimeout(250);
    await closeOnboardingIfVisible(page);
    const pageText = await page.evaluate(
      () => (document.body?.innerText || "").toLowerCase()
    );
    const notFound =
      pageText.includes("404") ||
      pageText.includes("acorde não encontrado") ||
      pageText.includes("acorde nao encontrado");

    results.push({
      chord: `${chord.root}${chord.suffix}`,
      route,
      status,
      notFound,
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      consoleErrors: consoleErrors.slice(0, 5),
    });

    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }

  await context.close();
  await browser.close();

  const summary = {
    chordChecks: results.length,
    chordNotFoundCount: results.filter((r) => r.notFound).length,
    chordStatusNullCount: results.filter((r) => r.status === null).length,
    chordConsoleErrorCount: results.filter((r) => r.consoleErrorCount > 0).length,
  };

  const output = {
    metadata: {
      runId: RUN_ID,
      generatedAt: new Date().toISOString(),
      appUrl: APP_URL,
      storageState: STORAGE_STATE,
    },
    summary,
    results,
  };

  const reportPath = path.join(OUT_DIR, "chord_recheck_report.json");
  const summaryPath = path.join(OUT_DIR, "chord_recheck_summary.json");
  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2));
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  console.log(
    JSON.stringify(
      {
        ok: true,
        outDir: OUT_DIR,
        reportPath,
        summaryPath,
      },
      null,
      2
    )
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
