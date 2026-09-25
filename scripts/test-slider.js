const puppeteer = require('puppeteer-core');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/canvas?view=archive&folder=motion-graphics', { waitUntil: 'networkidle2' });
  await page.waitForSelector('h3');

  // Open Spacing Tuner
  await page.keyboard.down('Shift');
  await page.keyboard.press('KeyS');
  await page.keyboard.up('Shift');
  await new Promise((r) => setTimeout(r, 600));

  // Click Case Modal tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find((x) => x.textContent && x.textContent.includes('Case Modal'));
    if (b) b.click();
  });
  await new Promise((r) => setTimeout(r, 600));

  // Find all sliders in modal tab
  const slidersInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="range"]'));
    return inputs.map((input) => ({
      min: input.min,
      max: input.max,
      value: input.value,
      parentText: input.closest('div')?.innerText?.slice(0, 40),
    }));
  });
  console.log('Sliders in tuner:', slidersInfo);

  // Simulate dragging first slider
  const result = await page.evaluate(async () => {
    const input = document.querySelector('input[type="range"]');
    if (!input) return { error: 'no input found' };

    // Native setter for React controlled input
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(input, '64');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await new Promise((r) => setTimeout(r, 300));
    const card = document.querySelector('section.bg-\\[\\#f6f5f2\\]');
    return {
      newValue: input.value,
      cardPadding: card ? window.getComputedStyle(card).paddingTop : null,
      rootVar: window.getComputedStyle(document.documentElement).getPropertyValue('--modal-card-padding'),
    };
  });

  console.log('Result after dragging slider:', result);
  await browser.close();
}

test().catch(console.error);
