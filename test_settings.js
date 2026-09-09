const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotDir = '/tmp/gear-tracker-screenshots';

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1820, height: 1100 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForURL('**/library');
    
    // Navigate to Einstellungen (Settings)
    console.log('Navigating to Einstellungen tab');
    await page.click('text=Einstellungen');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '15-einstellungen-light.png'), fullPage: true });
    console.log('✓ Screenshot saved: 15-einstellungen-light.png');
    
    // Toggle dark mode - it's a button with text "Dark" or "Light"
    console.log('Toggling dark mode');
    const darkModeButton = page.locator('button:has-text("Dark"), button:has-text("Light")');
    await darkModeButton.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(screenshotDir, '16-dark-mode-enabled.png'), fullPage: true });
    console.log('✓ Screenshot saved: 16-dark-mode-enabled.png');
    
    // Go back to library to show dark mode there too
    console.log('Viewing Library in dark mode');
    await page.click('text=Library');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '17-library-dark-mode.png'), fullPage: true });
    console.log('✓ Screenshot saved: 17-library-dark-mode.png');
    
    console.log('\n✓✓✓ Dark mode testing completed! ✓✓✓');
    
    // List all screenshots
    const files = fs.readdirSync(screenshotDir).filter(f => f.endsWith('.png') && !f.startsWith('error')).sort();
    console.log('\n=== ALL SCREENSHOT FILES ===');
    files.forEach(file => {
      console.log(`  ${path.join(screenshotDir, file)}`);
    });
    console.log('============================\n');
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await browser.close();
  }
})();
