const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Interactive Playwright Assessment...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const artifactDir = '/root/.gemini/antigravity-cli/brain/de91f4cd-72fd-4ff6-9bf6-e56bda757ba7';

  const url = 'https://atlas-web-console-red.vercel.app';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Click bypass login button
  console.log('Clicking Vibe Mode bypass button...');
  await page.click('text=ENTRAR NO MODO VIBE');
  await page.waitForTimeout(1000);

  // Verify page title
  const title = await page.title();
  console.log(`Page title: ${title}`);

  // Onboarding action: click pre-fill suggest button
  console.log('Clicking AI Prompt pre-fill template...');
  await page.click('text=AI Prompting Studio');
  await page.waitForTimeout(500);

  // Take onboarding pre-filled screenshot
  await page.screenshot({ path: path.join(artifactDir, 'onboarding_start.png') });

  // Submit start alignment
  console.log('Starting cognitive alignment...');
  await page.click('button[type="submit"]');

  // Wait for interview chat panel
  console.log('Waiting for chat dialogue...');
  await page.waitForSelector('text=DISCOVERY CHAT SESSION');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'onboarding_interview.png') });

  // Fill and submit Question 1
  console.log('Answering Question 1...');
  await page.fill('input[placeholder="Responda à IA sobre as regras do seu negócio..."]', 'Use queues for processing data asynchronously.');
  await page.click('button:has-text("ENVIAR")');
  await page.waitForTimeout(1500);

  // Fill and submit Question 2
  console.log('Answering Question 2...');
  await page.fill('input[placeholder="Responda à IA sobre as regras do seu negócio..."]', 'Adhere strictly to clean architecture.');
  await page.click('button:has-text("ENVIAR")');
  await page.waitForTimeout(1500);

  // Click Approve and Compile Blueprint
  console.log('Approving architecture layout...');
  await page.click('button:has-text("APROVAR E COMPILAR BLUEPRINT")');

  // Wait for compiler terminal
  console.log('Waiting for compiler terminal...');
  await page.waitForSelector('text=COMPILER ACTIVE');
  await page.screenshot({ path: path.join(artifactDir, 'onboarding_compiling.png') });

  // Wait for dashboard translation
  console.log('Waiting for main dashboard...');
  await page.waitForSelector('text=BLUEPRINT ATIVO', { timeout: 15000 });
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_monitor.png') });

  // Verify Blueprint Topology Tab
  console.log('Navigating to Blueprint Topology tab...');
  await page.click('text=TOPOLOGY');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_blueprint.png') });

  // Verify Drift Auditor Tab
  console.log('Navigating to Drift Auditor tab...');
  await page.click('text=DRIFT AUDITOR');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_audit.png') });

  // Resolve Drift
  console.log('Resolving code file drift...');
  await page.click('text=CORRIGIR DRIFT');
  await page.waitForTimeout(2200); // wait for drift resolve simulation timeout
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_audit_resolved.png') });

  // Verify Governance Tab
  console.log('Navigating to Governance tab...');
  await page.click('text=GOVERNANCE');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_assets_constitution.png') });

  console.log('E2E Interactive assessment completed successfully.');
  await browser.close();
})();
