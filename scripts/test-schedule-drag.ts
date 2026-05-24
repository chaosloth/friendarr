import axios from 'axios';
import { chromium } from 'playwright';

const API_KEY = 'asdfasdf-1234-5678-90ab-cdef12345678';
const BASE = 'http://localhost:5056';
const auth = { headers: { Authorization: `Bearer ${API_KEY}` } };

async function main() {
  // 1. Start with a known state: 3 windows on Monday
  await axios.put(`${BASE}/api/v1/settings`, {
    schedules: [{
      days: [1],
      windows: [
        { start: '02:00', end: '06:00', bandwidth: 0 },
        { start: '10:00', end: '14:00', bandwidth: 0 },
        { start: '18:00', end: '22:00', bandwidth: 0 },
      ]
    }]
  }, auth);
  console.log('Created 3-window schedule');

  // 2. Open browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Log browser console
  page.on('console', msg => console.log('[browser]', msg.text()));
  page.on('pageerror', err => console.error('[browser error]', err.message));

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });

  // Handle setup wizard
  const wizard = page.locator('#wizard-skip');
  if (await wizard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await wizard.click();
    await page.waitForTimeout(300);
  }

  // Authenticate
  const authBtn = page.locator('#auth-btn');
  if (await authBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await authBtn.click();
    await page.locator('#auth-key-input').fill(API_KEY);
    await page.locator('button', { hasText: 'Connect' }).click();
    await page.waitForTimeout(500);
  }
  console.log('Authenticated');

  // Navigate to Schedules tab
  await page.locator('[data-view="settings"]').click();
  await page.waitForTimeout(500);
  const schedTab = page.locator('button', { hasText: 'Schedules' });
  if (await schedTab.isVisible({ timeout: 3000 }).catch(() => false)) {
    await schedTab.click();
    await page.waitForTimeout(500);
  }
  console.log('Navigated to Schedules');

  // 3. Drag first row to below third row using native DnD events
  const rows = page.locator('[data-si][data-wi]');
  const rowCount = await rows.count();
  console.log(`Found ${rowCount} rows`);
  if (rowCount < 3) { console.log('Not enough rows'); await browser.close(); process.exit(1); }

  // Dispatch real HTML5 DnD events programmatically
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-si][data-wi]'));
    const src = rows[0], tgt = rows[2];
    if (!src || !tgt) throw new Error('rows not found');

    // Build and dispatch dragstart
    const dt = new DataTransfer();
    const ds = new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt });
    src.dispatchEvent(ds);

    // Drag over the target
    const de = new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt });
    tgt.dispatchEvent(de);

    // Drop on target
    const dp = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt });
    tgt.dispatchEvent(dp);

    // End drag
    const end = new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt });
    src.dispatchEvent(end);
  });
  await page.waitForTimeout(1000);

  // 4. Verify order changed via API
  const res = await axios.get(`${BASE}/api/v1/settings`, auth);
  const windows = res.data.schedules[0].windows;
  const order = windows.map((w: { start: string }) => w.start).join(', ');
  console.log('Windows order after drag:', order);

  const expected = windows[0].start === '10:00' && windows[1].start === '18:00' && windows[2].start === '02:00';
  console.log(expected ? 'PASS: Reordered correctly' : 'FAIL: Order did not change');

  await browser.close();
  process.exit(expected ? 0 : 1);
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
