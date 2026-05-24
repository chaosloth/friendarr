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
    name: "wizard-step1",
    description: "Wizard — Language selection",
    path: "/",
  },
  {
    name: "wizard-step2",
    description: "Wizard — API key creation",
    path: "/",
  },
  {
    name: "wizard-step3",
    description: "Wizard — Path configuration",
    path: "/",
  },
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

  const wizardModal = page.locator("#setup-wizard");
  const wizardVisible = (await wizardModal.count()) > 0;

  const screensToCapture: ScreenshotTarget[] = args.all
    ? targets
    : args.path && args.name
      ? [{ name: args.name, path: args.path, description: args.name }]
      : [];

  if (screensToCapture.length === 0) {
    console.log("Usage: --all to capture all, or --path <path> --name <name>");
    await browser.close();
    return;
  }

  const hasWizardTargets = screensToCapture.some((t) => t.name.startsWith("wizard-"));

  if (hasWizardTargets) {
    if (!wizardVisible) {
      console.log(
        "Wizard not shown — API_KEY may already be configured. Comment it out in .env to see the wizard.",
      );
    } else {
      await page.waitForSelector("#setup-wizard.flex", { timeout: 5000 });
      await page.waitForTimeout(500);

      const doCapture = async (name: string) => {
        await page.waitForTimeout(500);
        const outputPath = resolve(outputDir, `${name}.png`);
        await page.screenshot({ path: outputPath, fullPage: false });
        console.log(`  Saved: ${outputPath}`);
      };

      // Step 1: Language selection
      if (screensToCapture.some((t) => t.name === "wizard-step1")) {
        console.log("Capturing: Wizard step 1 — Language selection...");
        await doCapture("wizard-step1");
      }

      // Step 2: Key creation
      if (screensToCapture.some((t) => t.name === "wizard-step2")) {
        const nextBtn = page.locator("#wizard-next");
        if ((await nextBtn.count()) > 0) {
          await nextBtn.click();
          await page.waitForTimeout(800);
        }

        // Generate a key
        const genBtn = page.locator('button:has-text("Generate Key")');
        if ((await genBtn.count()) > 0) {
          await genBtn.click();
          await page.waitForTimeout(500);
        }

        console.log("Capturing: Wizard step 2 — API key creation...");
        await doCapture("wizard-step2");
      }

      // Step 3: Path configuration
      if (screensToCapture.some((t) => t.name === "wizard-step3")) {
        const actBtn = page.locator("#wizard-next");
        if ((await actBtn.count()) > 0) {
          await actBtn.click();
          await page.waitForTimeout(1500);
        }

        // If Activate button appeared (no master key), click it
        const activateBtn = page.locator('button:has-text("Save & Activate")');
        if ((await activateBtn.count()) > 0) {
          await activateBtn.click();
          await page.waitForTimeout(3000);
          // Wizard should be closed now — go to step 3
          const wizardStill = page.locator("#setup-wizard.flex");
          if ((await wizardStill.count()) === 0) {
            console.log("Wizard completed via activation");
          }
        } else {
          // hasMasterKey path — Next should go to step 3
          console.log("Capturing: Wizard step 3 — Path configuration...");
          await doCapture("wizard-step3");
        }
      }

      // If we activated, wizard is done and we're authenticated
      // If we just went to step 3, finish the wizard
      const wizardStillAfter = page.locator("#setup-wizard.flex");
      if ((await wizardStillAfter.count()) > 0) {
        // On step 3, click Finish
        const finishBtn = page.locator("#wizard-next");
        if ((await finishBtn.count()) > 0) {
          await finishBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    // If we only wanted wizard screenshots, skip auth and regular capture
    const onlyWizard = screensToCapture.every((t) => t.name.startsWith("wizard-"));
    if (onlyWizard) {
      await browser.close();
      return;
    }
  } else if (wizardVisible) {
    // No wizard targets but wizard is showing — skip it
    try {
      await page.waitForSelector("#setup-wizard.flex", { timeout: 3000 });
      await page.locator("#wizard-skip").click();
      await page.waitForTimeout(500);
      console.log("Skipped setup wizard");
    } catch {
      console.log("Setup wizard not shown");
    }
  }

  // Open auth modal via button (only if not already authenticated)
  const authStatus = page.locator("#auth-status");
  const alreadyAuthed = (await authStatus.count()) > 0 &&
    !(await authStatus.textContent())?.includes("Not authenticated");
  if (!alreadyAuthed) {
    const authBtn = page.locator("#auth-btn");
    if ((await authBtn.count()) > 0) {
      await authBtn.click();
      await page.waitForSelector("#auth-modal.flex", { timeout: 5000 });

      // Fill in the master API key
      const keyInput = page.locator("#auth-key-input");
      await keyInput.fill(apiKey);

      // Click Connect
      await page.locator('button:text("Connect")').click();

      // Wait for auth to complete
      await page.waitForTimeout(2000);
      console.log("Authenticated");
    } else {
      console.log("Auth button not found — continuing");
    }
  } else {
    console.log("Already authenticated");
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
