const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Interactive Playwright Assessment...');
  const artifactDir = '/root/.gemini/antigravity-cli/brain/de91f4cd-72fd-4ff6-9bf6-e56bda757ba7';
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  const url = 'https://atlas-web-console-fx5ixxvna-stdmatheus-5418s-projects.vercel.app';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Verify page title
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Onboarding action: click pre-fill suggest button
  console.log('Clicking AI Prompt pre-fill template...');
  await page.click('text=🤖 AI Prompt');
  await page.waitForTimeout(500);

  // Take onboarding pre-filled screenshot
  await page.screenshot({ path: path.join(artifactDir, 'onboarding_start.png') });

  // Submit start alignment
  console.log('Starting cognitive alignment...');
  await page.click('button[type="submit"]');

  // Wait for interview chat panel
  console.log('Waiting for chat dialogue...');
  await page.waitForSelector('text=DIALOGUE SESSION');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'onboarding_interview.png') });

  // Fill and submit Question 1
  console.log('Answering Question 1...');
  await page.fill('input[placeholder="Digite sua resposta técnica ou justificativa..."]', 'Use BullMQ and Redis queues for background processing.');
  await page.click('button >> text=SUBMIT');
  await page.waitForTimeout(1000);

  // Fill and submit Question 2
  console.log('Answering Question 2...');
  await page.fill('input[placeholder="Digite sua resposta técnica ou justificativa..."]', 'Single unified database schema to start.');
  await page.click('button >> text=SUBMIT');

  // Wait for compiler terminal
  console.log('Waiting for compiler terminal...');
  await page.waitForSelector('text=COMPILING BLUEPRINT');
  await page.screenshot({ path: path.join(artifactDir, 'onboarding_compiling.png') });

  // Wait for dashboard translation
  console.log('Waiting for main dashboard...');
  await page.waitForSelector('text=COGNITIVE WORKSPACE PROFILE', { timeout: 15000 });
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_monitor.png') });

  // Verify Blueprint Topology Tab
  console.log('Navigating to Blueprint Topology tab...');
  await page.click('text=BLUEPRINT TOPO');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_blueprint.png') });

  // Verify Drift Auditor Tab
  console.log('Navigating to Drift Auditor tab...');
  await page.click('text=DRIFT AUDITOR');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_audit.png') });

  // Resolve Drift
  console.log('Resolving code file drift...');
  await page.click('text=RESOLVE DRIFT');
  await page.waitForTimeout(2200); // wait for drift resolve simulation timeout
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_audit_resolved.png') });

  // Verify Architecture Assets Tab
  console.log('Navigating to Architecture Assets tab...');
  await page.click('text=ARCHITECTURE ASSETS');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_assets_constitution.png') });

  // Verify Backlog subtab
  console.log('Navigating to Backlog subtab...');
  await page.click('text=Backlog.json');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_assets_backlog.png') });

  console.log('E2E Interactive assessment completed successfully.');
  await browser.close();
})();
