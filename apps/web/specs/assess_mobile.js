const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Playwright Mobile Assessment...');
  const artifactDir = '/root/.gemini/antigravity-cli/brain/de91f4cd-72fd-4ff6-9bf6-e56bda757ba7';
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const iPhone13 = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone13,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  const url = 'https://atlas-web-console-fx5ixxvna-stdmatheus-5418s-projects.vercel.app';
  
  console.log(`Navigating to mobile view: ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Pre-fill template
  console.log('Selecting pre-fill template on mobile...');
  await page.click('text=🤖 AI Prompt');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_onboarding.png') });

  // Submit form
  console.log('Submitting onboarding form...');
  await page.click('button[type="submit"]');

  // Wait for interview chat panel
  console.log('Waiting for chat dialogue...');
  await page.waitForSelector('text=DIALOGUE SESSION');
  await page.screenshot({ path: path.join(artifactDir, 'mobile_interview.png') });

  // Fill and submit Question 1
  console.log('Answering Question 1...');
  await page.fill('input[placeholder="Digite sua resposta técnica ou justificativa..."]', 'Use queues on Redis.');
  await page.click('button >> text=SUBMIT');
  await page.waitForTimeout(1000);

  // Fill and submit Question 2
  console.log('Answering Question 2...');
  await page.fill('input[placeholder="Digite sua resposta técnica ou justificativa..."]', 'Single DB schema.');
  await page.click('button >> text=SUBMIT');

  // Wait for compiler terminal
  console.log('Waiting for compiler terminal...');
  await page.waitForSelector('text=COMPILING BLUEPRINT');
  await page.screenshot({ path: path.join(artifactDir, 'mobile_compiling.png') });

  // Wait for dashboard translation
  console.log('Waiting for main dashboard...');
  await page.waitForSelector('text=COGNITIVE WORKSPACE PROFILE', { timeout: 15000 });
  await page.screenshot({ path: path.join(artifactDir, 'mobile_dashboard.png') });

  // Click on "BLUEPRINT" tab in bottom nav
  console.log('Navigating to Blueprint tab...');
  await page.locator('.mobile-bottom-nav button >> text=BLUEPRINT').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_blueprint.png') });

  // Click on "AUDIT" tab in bottom nav
  console.log('Navigating to Audit tab...');
  await page.locator('.mobile-bottom-nav button >> text=AUDIT').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_audit.png') });

  // Click on "ASSETS" tab in bottom nav
  console.log('Navigating to Assets tab...');
  await page.locator('.mobile-bottom-nav button >> text=ASSETS').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'mobile_assets.png') });

  console.log('Mobile Assessment finished successfully.');
  await browser.close();
})();
