const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Playwright Mobile Assessment...');
  const artifactDir = '/root/.gemini/antigravity-cli/brain/de91f4cd-72fd-4ff6-9bf6-e56bda757ba7';
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Emulate iPhone 13
  const iPhone13 = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone13,
    isMobile: true,
    hasTouch: true
  });
  
  const page = await context.newPage();
  const url = 'https://atlas-web-console-nbk8s1j4m-stdmatheus-5418s-projects.vercel.app';
  
  console.log(`Navigating to mobile view: ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Take onboarding screenshot
  const onboardingPath = path.join(artifactDir, 'mobile_onboarding.png');
  console.log(`Taking mobile screenshot of onboarding to ${onboardingPath}...`);
  await page.screenshot({ path: onboardingPath });

  // Onboarding action: Fill and submit form
  console.log('Filing onboarding form on mobile...');
  await page.locator('input[type="text"]').first().fill('mobile-app-workspace');
  await page.locator('input[type="text"]').last().fill('Mobile responsive app-like view');

  console.log('Submitting onboarding form...');
  await page.click('button[type="submit"]');

  // Wait for transition to dashboard
  console.log('Waiting for dashboard transition...');
  await page.waitForSelector('text=ATLAS :', { timeout: 10000 });

  // Take dashboard monitor screenshot
  const dashboardPath = path.join(artifactDir, 'mobile_dashboard.png');
  console.log(`Taking mobile screenshot of dashboard monitor to ${dashboardPath}...`);
  await page.screenshot({ path: dashboardPath });

  // Click on "BLUEPRINT" tab in the bottom navigation bar
  console.log('Clicking on Blueprint tab in bottom nav...');
  await page.locator('.mobile-bottom-nav button >> text=BLUEPRINT').click();
  await page.waitForTimeout(1000);
  const blueprintPath = path.join(artifactDir, 'mobile_blueprint.png');
  console.log(`Taking mobile screenshot of blueprint schematic to ${blueprintPath}...`);
  await page.screenshot({ path: blueprintPath });

  // Click on "AUDIT" tab in the bottom navigation bar
  console.log('Clicking on Audit tab in bottom nav...');
  await page.locator('.mobile-bottom-nav button >> text=AUDIT').click();
  await page.waitForTimeout(1000);
  const auditPath = path.join(artifactDir, 'mobile_audit.png');
  console.log(`Taking mobile screenshot of audit dashboard to ${auditPath}...`);
  await page.screenshot({ path: auditPath });

  console.log('Mobile Assessment finished successfully.');
  await browser.close();
})();
