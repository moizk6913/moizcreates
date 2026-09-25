const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve('C:/Users/voids/.gemini/antigravity/brain/6057c7c6-9cec-4fde-8947-5cb4f014743c/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1000', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:3000/canvas?view=archive&folder=motion-graphics ...');
  await page.goto('http://localhost:3000/canvas?view=archive&folder=motion-graphics', { waitUntil: 'networkidle2' });

  // Wait for modal to appear
  await page.waitForSelector('h3', { timeout: 10000 });
  await new Promise((r) => setTimeout(r, 1500));

  // 1. Capture Modal Header & Top View
  console.log('Capturing modal header...');
  await page.screenshot({
    path: path.join(OUT_DIR, '10_modal_overview_header.png'),
  });

  // 2. Open Dedicated Spacing & Roundness Popover
  console.log('Opening Modal Spacing Popover...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent && b.textContent.includes('SPACING & ROUNDNESS'));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Capture Dedicated Spacing & Roundness Popover
  console.log('Capturing Dedicated Spacing & Roundness Popover...');
  await page.screenshot({
    path: path.join(OUT_DIR, '11_modal_spacing_tuner.png'),
  });

  // Close popover
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find((b) => b.textContent && b.textContent.trim() === 'Done');
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await new Promise((r) => setTimeout(r, 500));

  // 3. Scroll modal container to bottom
  console.log('Scrolling modal internal container to bottom...');
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('[data-lenis-prevent].overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Capture bottom of modal deliverables stream
  console.log('Capturing ending deliverables row...');
  await page.screenshot({
    path: path.join(OUT_DIR, '12_modal_ending_row_noflaws.png'),
  });

  await browser.close();
  console.log('Done capturing screenshots!');
}

run().catch((err) => {
  console.error('Error running capture:', err);
  process.exit(1);
});
