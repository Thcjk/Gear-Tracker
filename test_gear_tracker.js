const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotDir = '/tmp/gear-tracker-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1820, height: 1100 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('1. Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for redirect to /library
    await page.waitForURL('**/library');
    console.log('✓ Redirected to /library');
    
    await page.screenshot({ path: path.join(screenshotDir, '01-library-initial.png'), fullPage: true });
    console.log('Screenshot saved: 01-library-initial.png');
    
    // Try clicking "+ Neu" button
    console.log('\n2. Attempting to click "+ Neu" button');
    
    // Wait for the button to be visible
    const neuButton = page.locator('button:has-text("Neu")');
    await neuButton.waitFor({ state: 'visible', timeout: 5000 });
    
    await neuButton.click();
    console.log('✓ Clicked "+ Neu" button');
    
    // Wait for form to appear
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '02-form-opened.png'), fullPage: true });
    console.log('Screenshot saved: 02-form-opened.png');
    
    // Fill in first item: Zpacks Duplex
    console.log('\n3. Filling in first item: Zpacks Duplex');
    
    // Fill name - use label + input approach
    await page.locator('label:has-text("Name") input').fill('Zpacks Duplex');
    
    // Select category - Shelter
    await page.locator('label:has-text("Kategorie") select').selectOption('shelter');
    
    // Fill weight
    await page.locator('label:has-text("Gewicht") input').fill('539');
    
    // Fill price
    await page.locator('label:has-text("Preis") input').fill('699');
    
    // Fill notes
    await page.locator('label:has-text("Notizen") textarea').fill('2-person tarp tent');
    
    await page.screenshot({ path: path.join(screenshotDir, '03-item1-filled.png'), fullPage: true });
    console.log('Screenshot saved: 03-item1-filled.png');
    
    // Click submit button (Hinzufügen)
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    console.log('✓ Submitted first item');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '04-item1-added.png'), fullPage: true });
    console.log('Screenshot saved: 04-item1-added.png');
    
    // Add second item: Enlightened Equipment Revelation
    console.log('\n4. Adding second item: Enlightened Equipment Revelation');
    await page.click('button:has-text("Neu")');
    await page.waitForTimeout(500);
    
    await page.locator('label:has-text("Name") input').fill('Enlightened Equipment Revelation');
    await page.locator('label:has-text("Kategorie") select').selectOption('sleep-system');
    await page.locator('label:has-text("Gewicht") input').fill('480');
    await page.locator('label:has-text("Preis") input').fill('340');
    
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    console.log('✓ Submitted second item');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '05-item2-added.png'), fullPage: true });
    console.log('Screenshot saved: 05-item2-added.png');
    
    // Add third item: Gossamer Gear Gorilla 50
    console.log('\n5. Adding third item: Gossamer Gear Gorilla 50');
    await page.click('button:has-text("Neu")');
    await page.waitForTimeout(500);
    
    await page.locator('label:has-text("Name") input').fill('Gossamer Gear Gorilla 50');
    await page.locator('label:has-text("Kategorie") select').selectOption('backpack');
    await page.locator('label:has-text("Gewicht") input').fill('850');
    await page.locator('label:has-text("Preis") input').fill('280');
    
    await page.click('button[type="submit"]:has-text("Hinzufügen")');
    console.log('✓ Submitted third item');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '06-all-items-added.png'), fullPage: true });
    console.log('Screenshot saved: 06-all-items-added.png');
    
    // Navigate to Listen (Lists)
    console.log('\n6. Navigating to Listen tab');
    await page.click('text=Listen');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '07-listen-tab.png'), fullPage: true });
    console.log('Screenshot saved: 07-listen-tab.png');
    
    // Create a packing list
    console.log('\n7. Creating packing list: Weekend Alps');
    await page.click('button:has-text("Neu")');
    await page.waitForTimeout(500);
    
    await page.locator('label:has-text("Name") input').fill('Weekend Alps');
    await page.click('button[type="submit"]');
    console.log('✓ Created packing list');
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '08-list-created.png'), fullPage: true });
    console.log('Screenshot saved: 08-list-created.png');
    
    // Open the list and add items
    console.log('\n8. Opening list and adding items');
    await page.click('text=Weekend Alps');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '09-list-opened.png'), fullPage: true });
    console.log('Screenshot saved: 09-list-opened.png');
    
    // Add all three items to the list
    console.log('Adding items to list...');
    const addButtons = await page.locator('button:has-text("+")').all();
    for (let i = 0; i < Math.min(3, addButtons.length); i++) {
      await addButtons[i].click();
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ path: path.join(screenshotDir, '10-items-added-to-list.png'), fullPage: true });
    console.log('Screenshot saved: 10-items-added-to-list.png');
    
    // Check one item as packed
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    if (checkboxes.length > 0) {
      await checkboxes[0].click();
      console.log('✓ Checked first item as packed');
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '11-item-checked.png'), fullPage: true });
    console.log('Screenshot saved: 11-item-checked.png');
    
    // View dashboard
    console.log('\n9. Viewing dashboard with stats');
    await page.screenshot({ path: path.join(screenshotDir, '11b-dashboard-stats.png'), fullPage: true });
    console.log('Screenshot saved: 11b-dashboard-stats.png');
    
    // Navigate to Vergleich (Comparison)
    console.log('\n10. Navigating to Vergleich tab');
    await page.click('text=Vergleich');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '12-vergleich-tab.png'), fullPage: true });
    console.log('Screenshot saved: 12-vergleich-tab.png');
    
    // Create second list for comparison if only one exists
    console.log('\n11. Creating second list for comparison');
    await page.click('text=Listen');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Neu")');
    await page.waitForTimeout(500);
    await page.locator('label:has-text("Name") input').fill('Thru-Hike');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    
    await page.click('text=Thru-Hike');
    await page.waitForTimeout(500);
    
    const addBtn = await page.locator('button:has-text("+")').first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ path: path.join(screenshotDir, '13-second-list-created.png'), fullPage: true });
    console.log('Screenshot saved: 13-second-list-created.png');
    
    // Go back to Vergleich
    await page.click('text=Vergleich');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '14-vergleich-with-lists.png'), fullPage: true });
    console.log('Screenshot saved: 14-vergleich-with-lists.png');
    
    // Navigate to Einstellungen (Settings)
    console.log('\n12. Navigating to Einstellungen tab');
    await page.click('text=Einstellungen');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '15-einstellungen-tab.png'), fullPage: true });
    console.log('Screenshot saved: 15-einstellungen-tab.png');
    
    // Toggle dark mode
    console.log('\n13. Toggling dark mode');
    const darkModeToggle = page.locator('input[type="checkbox"]').first();
    await darkModeToggle.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotDir, '16-dark-mode-enabled.png'), fullPage: true });
    console.log('Screenshot saved: 16-dark-mode-enabled.png');
    
    console.log('\n✓✓✓ All tests completed successfully! ✓✓✓');
    console.log(`\nScreenshots saved in: ${screenshotDir}`);
    
    // List all screenshots
    const files = fs.readdirSync(screenshotDir).sort();
    console.log('\n=== SCREENSHOT FILES ===');
    files.forEach(file => {
      console.log(`  ${path.join(screenshotDir, file)}`);
    });
    console.log('========================\n');
    
  } catch (error) {
    console.error('Error during testing:', error);
    await page.screenshot({ path: path.join(screenshotDir, 'error-state.png'), fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
})();
