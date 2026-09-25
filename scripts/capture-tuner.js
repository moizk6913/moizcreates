const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve('C:/Users/voids/.gemini/antigravity/brain/6057c7c6-9cec-4fde-8947-5cb4f014743c/screenshots');

async function captureTuner() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Click Spacing Tuner floating button to open drawer
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes('SPACING TUNER'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // 2. Capture Manifesto tab
  await page.screenshot({
    path: path.join(OUT_DIR, '08_tuner_manifesto.png'),
  });
  console.log('Captured 08_tuner_manifesto.png');

  // 3. Switch to Work & Logos tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('button'));
    const workTab = tabs.find(b => b.innerText && b.innerText.includes('WORK & LOGOS'));
    if (workTab) workTab.click();
  });

  await new Promise(r => setTimeout(r, 600));

  // 4. Capture Work & Logos tab
  await page.screenshot({
    path: path.join(OUT_DIR, '09_tuner_work_logos.png'),
  });
  console.log('Captured 09_tuner_work_logos.png');

  await browser.close();
  console.log('Done!');
}

captureTuner().catch(console.error);
