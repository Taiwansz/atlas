const { chromium, devices } = require('playwright');
const path = require('path');

(async () => {
  console.log('Starting Playwright Mobile Assessment...');
  
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 12'];
  const context = await browser.newContext({
    ...iPhone,
    permissions: ['geolocation']
  });
  
  const page = await context.newPage();
  const artifactDir = '/root/.gemini/antigravity-cli/brain/de91f4cd-72fd-4ff6-9bf6-e56bda757ba7';
  const url = 'https://atlas-web-console-red.vercel.app';
  
  try {
    console.log(`Navigating to mobile view: ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Click bypass login button
    console.log('Clicking Vibe Mode bypass button on mobile...');
    await page.click('text=ENTRAR NO MODO VIBE');
    await page.waitForTimeout(1000);

    // Pre-fill template
    console.log('Selecting pre-fill template on mobile...');
    await page.click('text=AI Prompting Studio');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_onboarding.png') });

    // Submit form
    console.log('Submitting onboarding form...');
    await page.click('button[type="submit"]');

    // Wait for interview chat panel
    console.log('Waiting for chat dialogue...');
    await page.waitForSelector('text=DISCOVERY CHAT SESSION');
    await page.screenshot({ path: path.join(artifactDir, 'mobile_interview.png') });

    const approveBtn = page.locator('button:has-text("APROVAR E COMPILAR BLUEPRINT")');

    // Wait for input to be active or early approval button
    console.log('Waiting for Maestro input field to become active...');
    await page.waitForSelector('.left-pane input[type="text"]:not([disabled]), button:has-text("APROVAR E COMPILAR BLUEPRINT")');

    if (await approveBtn.count() === 0) {
      // Fill and submit Question 1
      console.log('Answering Question 1...');
      await page.fill('.left-pane input[type="text"]', 'Use queues on Redis.');
      await page.click('button:has-text("ENVIAR")');
      await page.waitForTimeout(1000);
    }
    
    // Wait for Maestro response to render and unlock input OR skip to approval
    console.log('Waiting for Maestro reply to Question 1...');
    await page.waitForSelector('.left-pane input[type="text"]:not([disabled]), button:has-text("APROVAR E COMPILAR BLUEPRINT")');

    if (await approveBtn.count() === 0) {
      // Fill and submit Question 2
      console.log('Answering Question 2...');
      await page.fill('.left-pane input[type="text"]', 'Single DB schema.');
      await page.click('button:has-text("ENVIAR")');
    }
    
    // Wait for Approve button to render
    console.log('Waiting for architecture recap approval screen...');
    await page.waitForSelector('button:has-text("APROVAR E COMPILAR BLUEPRINT")');
    
    // Capture recap screenshot
    console.log('Taking recap screenshot...');
    await page.screenshot({ path: path.join(artifactDir, 'mobile_recap.png') });

    // Click Approve and Compile
    console.log('Approving architecture layout...');
    await page.click('button:has-text("APROVAR E COMPILAR BLUEPRINT")');

    // Wait for compiler terminal
    console.log('Waiting for compiler terminal...');
    await page.waitForSelector('text=COMPILER ACTIVE');
    await page.screenshot({ path: path.join(artifactDir, 'mobile_compiling.png') });

    // Wait for dashboard translation
    console.log('Waiting for main dashboard...');
    await page.waitForSelector('text=BLUEPRINT ATIVO', { timeout: 30000 });
    await page.screenshot({ path: path.join(artifactDir, 'mobile_dashboard.png') });

    // Click on "TOPOLOGY" tab
    console.log('Navigating to Topology tab...');
    await page.click('text=TOPOLOGY');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_blueprint.png') });

    // Click on "DRIFT AUDITOR" tab
    console.log('Navigating to Drift Auditor tab...');
    await page.click('text=DRIFT AUDITOR');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_audit.png') });

    console.log('Mobile Assessment finished successfully.');
  } catch (err) {
    console.error('Test execution failed, capturing failure screenshot...', err);
    await page.screenshot({ path: path.join(artifactDir, 'mobile_failure.png') });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
