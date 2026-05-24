import { existsSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { chromium } from "playwright";

interface ScreenshotTarget {
  name: string;
  description: string;
  path: string;
  selector?: string;
}

const targets: ScreenshotTarget[] = [
  {
    name: "queue",
    description: "Queue dashboard",
    path: "/",
    selector: ".nav-link",
  },
  {
    name: "settings",
    description: "Settings page — endpoints tab",
    path: "/",
    selector: ".nav-link",
  },
  {
    name: "logs",
    description: "Logs viewer",
    path: "/",
    selector: ".nav-link",
  },
];

function parseArgs(): { all: boolean; path?: string; name?: string } {
  const args = process.argv.slice(2);
  if (args.includes("--all")) return { all: true };

  const getArg = (flag: string) => {
    const idx = args.indexOf(`--${flag}`);
    return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
  };

  return {
    all: false,
    path: getArg("path"),
    name: getArg("name"),
  };
}

function getApiKey(): string {
  try {
    const env = readFileSync(resolve(__dirname, "../.env"), "utf-8");
    const match = env.match(/API_KEY\s*=\s*(.+)/);
    return match ? match[1].trim() : "";
  } catch {
    return "";
  }
}

async function main() {
  const args = parseArgs();
  const apiKey = getApiKey();

  if (!apiKey) {
    console.error(
      "No API_KEY found in .env. Set it to authenticate screenshots.",
    );
    process.exit(1);
  }

  const baseUrl = "http://localhost:5056";
  const outputDir = resolve(__dirname, "../docs/screenshots");

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
  });

  const page = await context.newPage();

  // Visit page
  await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 15000 });

  // Handle setup wizard if it appears
  const wizardModal = page.locator("#setup-wizard");
  if ((await wizardModal.count()) > 0) {
    try {
      await page.waitForSelector("#setup-wizard.flex", { timeout: 3000 });
      // Click Skip to bypass setup wizard
      await page.locator("#wizard-skip").click();
      await page.waitForTimeout(500);
      console.log("Skipped setup wizard");
    } catch {
      console.log("Setup wizard not shown");
    }
  }

  // Open auth modal via button
  const authBtn = page.locator("#auth-btn");
  if ((await authBtn.count()) > 0) {
    await authBtn.click();
    await page.waitForSelector("#auth-modal.flex", { timeout: 5000 });

    // Fill in the master API key
    const keyInput = page.locator("#auth-key-input");
    await keyInput.fill(apiKey);

    // Click Connect
    await page.locator('button:text("Connect")').click();

    // Wait for auth to complete (auth status changes from 'Not authenticated')
    await page.waitForTimeout(2000);
    const statusEl = page.locator("#auth-status");
    const statusText = (await statusEl.textContent()) || "";
    if (statusText.includes("Not authenticated")) {
      console.log("Auth may have failed, continuing anyway");
    }
    console.log("Authenticated");
  } else {
    console.log("Already authenticated or auth button not found");
  }

  const screensToCapture: ScreenshotTarget[] = args.all
    ? targets
    : args.path && args.name
      ? [
          {
            name: args.name,
            path: args.path,
            description: args.name,
          },
        ]
      : [];

  if (screensToCapture.length === 0) {
    console.log("Usage: --all to capture all, or --path <path> --name <name>");
    await browser.close();
    return;
  }

  for (const target of screensToCapture) {
    console.log(`Capturing: ${target.description}...`);

    await page.goto(`${baseUrl}${target.path}`, {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    if (target.selector) {
      try {
        await page.waitForSelector(target.selector, { timeout: 5000 });
      } catch {
        // selector wait failure is OK — page may have already rendered
      }
    }

    // Click the nav link if needed for settings/logs views
    if (target.name === "settings") {
      const settingsLink = page.locator('[data-view="settings"]');
      if ((await settingsLink.count()) > 0) {
        await settingsLink.click();
        await page.waitForTimeout(1500);
      }
    } else if (target.name === "logs") {
      // Click settings first, then logs tab within settings
      const settingsLink = page.locator('[data-view="settings"]');
      if ((await settingsLink.count()) > 0) {
        await settingsLink.click();
        await page.waitForTimeout(1000);
      }
      // Click logs tab
      const logsTab = page.locator('button:text("Logs")');
      if ((await logsTab.count()) > 0) {
        await logsTab.click();
        await page.waitForTimeout(1500);
      }
    }

    await page.waitForTimeout(1500);

    const outputPath = resolve(outputDir, `${target.name}.png`);
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(`  Saved: ${outputPath}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error("Screenshot failed:", err);
  process.exit(1);
});
