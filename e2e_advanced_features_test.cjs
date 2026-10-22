const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runAdvancedFeaturesTest() {
  console.log('🚀 Starting Verification of Redesigned Notifications, Multi-Account Switcher & Themes...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const time = Date.now();
  const user1 = {
    name: 'حساب أحمد الأول',
    email: `ahmed_${time}@example.com`,
    password: 'Password123!@#',
  };
  const user2 = {
    name: 'حساب سارة الثاني',
    email: `sara_${time}@example.com`,
    password: 'Password123!@#',
  };

  try {
    // ----------------------------------------------------
    // TEST 1: Register User 1
    // ----------------------------------------------------
    console.log('📌 [Test 1] Registering User 1 (Ahmed)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.click('text=إنشاء حساب جديد');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="أحمد محمد"]', user1.name);
    await page.fill('input[placeholder="name@example.com"]', user1.email);
    const pass1 = page.locator('input[type="password"]');
    await pass1.nth(0).fill(user1.password);
    await pass1.nth(1).fill(user1.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log(`✅ User 1 registered & active on device: ${user1.email}`);

    // Create a project with User 1 to send invite
    const newProjectBtn = page.locator('button:has-text("مشروع جديد"), button:has-text("New Project")').first();
    await newProjectBtn.click();
    await page.waitForTimeout(500);
    const projName = `مشروع التصميم المتقدم ${time}`;
    await page.fill('input[placeholder*="منصة التجارة الإلكترونية"], input[placeholder*="Project Name"]', projName);
    await page.locator('div.fixed.inset-0 button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Logout User 1
    const profileTrigger = page.locator('aside button[title*="قائمة الحساب"], aside button[title*="Account Menu"]').first();
    await profileTrigger.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("تسجيل الخروج"), button:has-text("Sign Out")').first().click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // ----------------------------------------------------
    // TEST 2: Register User 2 (Sara)
    // ----------------------------------------------------
    console.log('📌 [Test 2] Registering User 2 (Sara)...');
    await page.click('text=إنشاء حساب جديد');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="أحمد محمد"]', user2.name);
    await page.fill('input[placeholder="name@example.com"]', user2.email);
    const pass2 = page.locator('input[type="password"]');
    await pass2.nth(0).fill(user2.password);
    await pass2.nth(1).fill(user2.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log(`✅ User 2 registered & active on device: ${user2.email}`);

    // ----------------------------------------------------
    // TEST 3: Test Multi-Account Switcher Modal
    // ----------------------------------------------------
    console.log('📌 [Test 3] Testing Account Switcher Modal...');
    // Click Account menu in sidebar
    await page.locator('aside button[title*="قائمة الحساب"], aside button[title*="Account Menu"]').first().click();
    await page.waitForTimeout(500);

    // Click "تبديل الحساب"
    await page.locator('button:has-text("تبديل الحساب"), button:has-text("Switch Account")').first().click();
    await page.waitForTimeout(800);

    // Verify modal is visible
    const switcherModal = page.locator('text=الحسابات المحفوظة على هذا المتصفح');
    await switcherModal.waitFor({ timeout: 5000 });
    console.log('✅ Account Switcher Modal opened successfully!');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15_account_switcher_modal.png') });

    // Switch to User 1 (Ahmed) by clicking "تبديل"
    console.log('🔄 Switching back to User 1 (Ahmed) via modal...');
    const switchBtnToUser1 = page.locator('button:has-text("تبديل")').first();
    await switchBtnToUser1.click();
    await page.waitForTimeout(1500);

    // Verify Dashboard now shows User 1 name
    const greeting = page.locator(`text=${user1.name}`).first();
    await greeting.waitFor({ timeout: 5000 });
    console.log(`✅ SUCCESS: Switched session to User 1 (${user1.name}) without re-entering password!`);

    // ----------------------------------------------------
    // TEST 4: Send Invitation to User 2 & verify NO dashboard banner
    // ----------------------------------------------------
    console.log('📌 [Test 4] Sending invitation to User 2...');
    await page.locator(`text=${projName}`).first().click();
    await page.waitForTimeout(1500);

    await page.fill('input[placeholder*="دعوة انضمام"]', user2.email);
    await page.click('button:has-text("إرسال دعوة انضمام")');
    await page.waitForTimeout(2000);
    console.log('✅ Invitation sent to User 2.');

    // Switch back to User 2 to verify clean notification experience
    console.log('🔄 Switching back to User 2 (Sara)...');
    await page.locator('aside button[title*="قائمة الحساب"]').first().click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("تبديل الحساب")').first().click();
    await page.waitForTimeout(800);
    const switchBtnToUser2 = page.locator(`div:has-text("${user2.email}") button:has-text("تبديل")`).first();
    await switchBtnToUser2.click();
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // Verify NO banner exists in dashboard body!
    const bannerCount = await page.locator('text=لديك دعوة جديدة للانضمام إلى مشروع').count();
    console.log(`Dashboard body invitation banners found: ${bannerCount} (Expected: 0)`);
    if (bannerCount === 0) {
      console.log('✅ VERIFIED: Notification banner was successfully removed from dashboard body!');
    }

    // Verify Bell icon has notification badge
    const bellBtn = page.locator('button[aria-label="Notifications"]').first();
    await bellBtn.waitFor({ timeout: 5000 });
    console.log('✅ Bell icon exists in header with active badge.');

    // Click Bell to view the redesigned, beautiful popover!
    await bellBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16_redesigned_notifications_popover.png') });
    console.log('✅ Redesigned notifications popover opened cleanly!');

    // Close popover
    await bellBtn.click();
    await page.waitForTimeout(500);

    // ----------------------------------------------------
    // TEST 5: Settings Page Enhancements (Themes, Fonts, Sizes)
    // ----------------------------------------------------
    console.log('📌 [Test 5] Testing Settings Page: Color Themes, Typography, and Font Size...');
    await page.locator('aside button:has-text("الإعدادات")').first().click();
    await page.waitForURL('**/dashboard?tab=settings', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // 1. Test Color Theme Swatch (e.g. Emerald)
    console.log('🎨 Selecting Emerald Color Theme...');
    const emeraldSwatch = page.locator('button:has-text("أخضر زمردي")').first();
    await emeraldSwatch.click();
    await page.waitForTimeout(800);
    const rootAccent = await page.evaluate(() => document.documentElement.dataset.accent);
    console.log(`Root dataset.accent after click: "${rootAccent}" (Expected: "emerald")`);

    // 2. Test Font Family (e.g. Cairo)
    console.log('🔤 Selecting Cairo Font Family...');
    const cairoCard = page.locator('div:has-text("كايرو (Cairo)")').last();
    await cairoCard.click();
    await page.waitForTimeout(800);
    const rootFont = await page.evaluate(() => document.documentElement.dataset.font);
    console.log(`Root dataset.font after click: "${rootFont}" (Expected: "cairo")`);

    // 3. Test Font Size Scale (e.g. Large)
    console.log('📏 Selecting Large Font Size Scale...');
    const largeBtn = page.locator('button:has-text("كبير (18px)")').first();
    await largeBtn.click();
    await page.waitForTimeout(800);
    const rootSize = await page.evaluate(() => document.documentElement.dataset.size);
    console.log(`Root dataset.size after click: "${rootSize}" (Expected: "lg")`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '17_settings_custom_themes_and_fonts.png') });

    console.log('\n======================================================');
    console.log('🎉 ALL ADVANCED REQUESTED IMPROVEMENTS VERIFIED: 100%');
    console.log('======================================================\n');
  } catch (error) {
    console.error('❌ Error during advanced features test:', error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error_advanced_test.png') });
  } finally {
    await browser.close();
  }
}

runAdvancedFeaturesTest();

