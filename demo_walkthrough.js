const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1820, height: 1100 },
    recordVideo: {
      dir: '/tmp/gear-tracker-demo/',
      size: { width: 1820, height: 1100 }
    }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🎬 Starting demo walkthrough...');
    
    // Step 1: Open library
    console.log('1. Opening gear library...');
    await page.goto('http://localhost:3000/library', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Pause to show library
    
    // Step 2: Navigate to Listen (Lists)
    console.log('2. Navigating to Listen tab...');
    await page.click('text=Listen');
    await page.waitForTimeout(1500); // Pause to show lists
    
    // Step 3: Open Weekend Alps list (or first available list)
    console.log('3. Opening packing list...');
    const listLink = await page.locator('text=/Weekend Alps|Thru-Hike/').first();
    if (await listLink.isVisible({ timeout: 2000 })) {
      await listLink.click();
      await page.waitForTimeout(1500); // Pause to show list detail
      
      // Scroll down slightly to show dashboard stats
      console.log('   Scrolling to show dashboard...');
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(1500);
      await page.mouse.wheel(0, -300); // Scroll back up
      await page.waitForTimeout(500);
    } else {
      console.log('   No lists found, skipping...');
      await page.waitForTimeout(1000);
    }
    
    // Step 4: Navigate to Einstellungen (Settings)
    console.log('4. Navigating to Einstellungen...');
    await page.click('text=Einstellungen');
    await page.waitForTimeout(2000); // Pause to show settings
    
    // Step 5: Check dark mode and toggle if in light mode
    console.log('5. Checking dark mode...');
    const darkModeButton = page.locator('button:has-text("Dark"), button:has-text("Light")');
    const buttonText = await darkModeButton.textContent();
    
    if (buttonText.includes('Dark')) {
      console.log('   Light mode detected, toggling to dark...');
      await darkModeButton.click();
      await page.waitForTimeout(2000); // Show dark mode
    } else {
      console.log('   Dark mode already enabled');
      await page.waitForTimeout(1500);
    }
    
    // Brief tour back through tabs in dark mode
    console.log('6. Quick tour in dark mode...');
    await page.click('text=Library');
    await page.waitForTimeout(1500);
    
    console.log('✅ Demo walkthrough completed!');
    
  } catch (error) {
    console.error('❌ Error during demo:', error);
    throw error;
  } finally {
    await page.close();
    await context.close();
    
    console.log('\n🎥 Saving video...');
    // Video is saved automatically when context closes
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Demo recording saved to /tmp/gear-tracker-demo/');
    await browser.close();
  }
})();
