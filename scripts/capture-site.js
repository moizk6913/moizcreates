const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve('C:/Users/voids/.gemini/antigravity/brain/6057c7c6-9cec-4fde-8947-5cb4f014743c/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Hide Spacing Tuner for clean screenshots
  await page.evaluate(() => {
    const tunerButtons = document.querySelectorAll('button');
    tunerButtons.forEach(b => {
      if (b.innerText && b.innerText.includes('SPACING TUNER')) {
        b.style.display = 'none';
      }
    });
  });

  // Smooth scroll down to trigger GSAP scroll triggers & load images
  console.log('Triggering scroll reveals...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 80);
    });
  });

  await new Promise(r => setTimeout(r, 1200));

  // Ensure animated text tokens are visible for fullPage capture
  await page.evaluate(() => {
    document.querySelectorAll('.manifesto-token, .statement-line').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  // 1. Full Page Screenshot
  console.log('Capturing full page screenshot...');
  await page.screenshot({
    path: path.join(OUT_DIR, '00_full_page.png'),
    fullPage: true,
  });

  // 2. Section: Hero
  console.log('Capturing Hero...');
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({
    path: path.join(OUT_DIR, '01_hero.png'),
  });

  // 2b. Section: Manifesto
  console.log('Capturing Manifesto...');
  const manifestoEl = await page.$('#manifesto');
  if (manifestoEl) {
    await manifestoEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '01b_manifesto.png'),
    });
  }

  // 3. Section: Work Bento & References
  console.log('Capturing Work & References...');
  const workEl = await page.$('#work');
  if (workEl) {
    await workEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '02_work_bento.png'),
    });
  }

  // 3b. Section: References / Clients
  console.log('Capturing Clients / References...');
  const refEl = await page.$('#visual-references');
  if (refEl) {
    await refEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '02b_visual_references.png'),
    });
  }

  // 4. Section: Services
  console.log('Capturing Services...');
  const servicesEl = await page.$('#services');
  if (servicesEl) {
    await servicesEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '03_services.png'),
    });
  }

  // 5. Section: Process
  console.log('Capturing Process...');
  const processEl = await page.$('#approach');
  if (processEl) {
    await processEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '04_process.png'),
    });
  }

  // 6. Section: Testimonials
  console.log('Capturing Testimonials...');
  const testEl = await page.$('#testimonials');
  if (testEl) {
    await testEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '05_testimonials.png'),
    });
  }

  // 7. Section: FAQ
  console.log('Capturing FAQ...');
  const faqEl = await page.$('#faq');
  if (faqEl) {
    await faqEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '06_faq.png'),
    });
  }

  // 8. Section: Statement Bridge & Footer
  console.log('Capturing Statement & Footer...');
  const footerEl = await page.$('#contact');
  if (footerEl) {
    await footerEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({
      path: path.join(OUT_DIR, '07_statement_footer.png'),
    });
  }

  console.log('All screenshots captured successfully in', OUT_DIR);
  await browser.close();
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
