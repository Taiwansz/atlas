const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Playwright Assessment...');
  const artifactDir = '/root/.gemini/antigravity-cli/brain/de91f4cd-72fd-4ff6-9bf6-e56bda757ba7';
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const url = 'https://atlas-web-console-jlsnqf7ac-stdmatheus-5418s-projects.vercel.app';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  console.log('Page loaded. Checking title...');
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Take onboarding screenshot
  const onboardingPath = path.join(artifactDir, 'onboarding_state.png');
  console.log(`Taking screenshot of onboarding to ${onboardingPath}...`);
  await page.screenshot({ path: onboardingPath });

  // Onboarding action: Fill the form
  console.log('Filling out onboarding form...');
  await page.locator('input[type="text"]').first().fill('playwright-test-project');
  await page.locator('input[type="text"]').last().fill('Playwright automated assessment workspace');

  // Submit the form
  console.log('Submitting onboarding form...');
  await page.click('button[type="submit"]');

  // Wait for transition to dashboard
  console.log('Waiting for dashboard transition...');
  await page.waitForSelector('text=ATLAS :', { timeout: 10000 });

  // Take dashboard screenshot
  const dashboardPath = path.join(artifactDir, 'dashboard_state.png');
  console.log(`Taking screenshot of dashboard to ${dashboardPath}...`);
  await page.screenshot({ path: dashboardPath });

  // Click on "02. BLUEPRINT TOPO" tab
  console.log('Clicking on Blueprint tab...');
  await page.click('text=BLUEPRINT TOPO');
  await page.waitForTimeout(1000);
  const blueprintPath = path.join(artifactDir, 'blueprint_state.png');
  await page.screenshot({ path: blueprintPath });

  // Click on "03. DRIFT AUDITOR" tab
  console.log('Clicking on Drift Auditor tab...');
  await page.click('text=DRIFT AUDITOR');
  await page.waitForTimeout(1000);
  const auditPath = path.join(artifactDir, 'audit_state.png');
  await page.screenshot({ path: auditPath });

  console.log('Assessment finished successfully.');
  await browser.close();
})();
