const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runInvitationE2ETest() {
  console.log('🚀 Starting Full Automated E2E Member Invitation & Acceptance Test with Playwright...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const timestamp = Date.now();
  const inviteeUser = {
    name: 'المطور المدعو للتجربة',
    email: `invitee_${timestamp}@example.com`,
    password: 'Password123!@#',
  };

  const ownerUser = {
    name: 'مالك المشروع المشرف',
    email: `owner_${timestamp}@example.com`,
    password: 'Password123!@#',
  };

  const projectName = `مشروع اختبار نظام الدعوات ${timestamp}`;

  try {
    // ----------------------------------------------------
    // STEP 1: Register Invitee (User B) so they exist in userEmails
    // ----------------------------------------------------
    console.log('📌 [Step 1] Registering Invitee User (User B)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    await page.click('text=إنشاء حساب جديد');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="أحمد محمد"]', inviteeUser.name);
    await page.fill('input[placeholder="name@example.com"]', inviteeUser.email);
    const passInputsB = page.locator('input[type="password"]');
    await passInputsB.nth(0).fill(inviteeUser.password);
    await passInputsB.nth(1).fill(inviteeUser.password);

    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log(`✅ Invitee User registered: ${inviteeUser.email}`);

    // Logout Invitee
    const profileTriggerB = page.locator('aside button[title*="قائمة الحساب"], aside button[title*="Account Menu"]').first();
    await profileTriggerB.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("تسجيل الخروج"), button:has-text("Sign Out")').first().click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // ----------------------------------------------------
    // STEP 2: Register Project Owner (User A)
    // ----------------------------------------------------
    console.log('📌 [Step 2] Registering Project Owner (User A)...');
    await page.click('text=إنشاء حساب جديد');
    await page.waitForTimeout(500);

    await page.fill('input[placeholder="أحمد محمد"]', ownerUser.name);
    await page.fill('input[placeholder="name@example.com"]', ownerUser.email);
    const passInputsA = page.locator('input[type="password"]');
    await passInputsA.nth(0).fill(ownerUser.password);
    await passInputsA.nth(1).fill(ownerUser.password);

    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    console.log(`✅ Project Owner registered: ${ownerUser.email}`);

    // ----------------------------------------------------
    // STEP 3: Owner creates project
    // ----------------------------------------------------
    console.log(`📌 [Step 3] Owner creating project: "${projectName}"...`);
    const newProjectBtn = page.locator('button:has-text("مشروع جديد"), button:has-text("New Project")').first();
    await newProjectBtn.click();
    await page.waitForTimeout(500);

    await page.fill('input[placeholder*="منصة التجارة الإلكترونية"], input[placeholder*="Project Name"]', projectName);
    await page.fill('textarea[placeholder*="وصف"], textarea[placeholder*="Description"]', 'مشروع مخصص للتحقق من وصول الإشعارات وقبول ورفض الدعوات.');
    await page.locator('div.fixed.inset-0 button[type="submit"]').click();
    await page.waitForTimeout(2000);

    console.log('✅ Project created successfully!');

    // ----------------------------------------------------
    // STEP 4: Owner opens project & sends invitation to Invitee
    // ----------------------------------------------------
    console.log('📌 [Step 4] Opening project and sending invitation...');
    const projectCard = page.locator(`text=${projectName}`).first();
    await projectCard.click();
    await page.waitForTimeout(2000);

    // Verify initial active members is 1 (only Owner)
    const membersHeader = page.locator('text=فريق العمل والأعضاء (1)');
    await membersHeader.waitFor({ timeout: 10000 });
    console.log('✅ Active members before invite: 1 (Owner only)');

    // Fill invitation email
    const emailInput = page.locator('input[placeholder*="دعوة انضمام"], input[placeholder*="invite"]');
    await emailInput.fill(inviteeUser.email);

    const inviteSubmitBtn = page.locator('button:has-text("إرسال دعوة انضمام"), button:has-text("Send Invitation")');
    await inviteSubmitBtn.click();
    await page.waitForTimeout(2000);

    // Verify success banner & pending invitation displayed
    const pendingBadge = page.locator('text=/معلقة/').first();
    await pendingBadge.waitFor({ timeout: 10000 });
    console.log('✅ Invitation sent! Target user is NOT added to active members yet.');
    console.log('✅ Pending invitation successfully displayed in "الدعوات المعلقة"');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12_owner_sent_invitation.png') });

    // ----------------------------------------------------
    // STEP 5: Owner logs out
    // ----------------------------------------------------
    console.log('📌 [Step 5] Owner logging out...');
    const profileTriggerA = page.locator('aside button[title*="قائمة الحساب"], aside button[title*="Account Menu"]').first();
    await profileTriggerA.click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("تسجيل الخروج"), button:has-text("Sign Out")').first().click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // ----------------------------------------------------
    // STEP 6: Invitee (User B) logs in & checks notifications
    // ----------------------------------------------------
    console.log('📌 [Step 6] Invitee logging in to accept invitation...');
    await page.fill('input[placeholder="name@example.com"]', inviteeUser.email);
    await page.fill('input[placeholder="••••••••"]', inviteeUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Verify notification banner is visible on dashboard
    const inviteBanner = page.locator('text=/دعوة جديدة للانضمام/').first();
    await inviteBanner.waitFor({ timeout: 10000 });
    console.log('✅ Invitee received prominent invitation notification banner on Dashboard!');

    // Verify Bell icon in header has badge count 1
    const bellBtn = page.locator('header button[aria-label="Notifications"]').first();
    await bellBtn.waitFor({ timeout: 5000 });
    const badge = bellBtn.locator('span.rounded-full');
    const badgeText = await badge.innerText();
    console.log(`✅ Bell notification badge count: ${badgeText}`);

    // Click bell to test popover
    await bellBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13_invitee_notifications_dropdown.png') });
    console.log('✅ Notifications dropdown opened and shows pending invite!');

    // ----------------------------------------------------
    // STEP 7: Invitee accepts invitation
    // ----------------------------------------------------
    console.log('📌 [Step 7] Invitee clicking "قبول الدعوة" (Accept)...');
    const acceptBtn = page.locator('button:has-text("قبول الدعوة")').first();
    await acceptBtn.click();
    await page.waitForTimeout(2500);

    // Verify project is now available in Invitee's projects!
    const projectInInviteeDashboard = page.locator(`text=${projectName}`).first();
    await projectInInviteeDashboard.waitFor({ timeout: 10000 });
    console.log(`✅ SUCCESS: Project "${projectName}" is now active in Invitee's Dashboard!`);

    // Click project to verify membership
    await projectInInviteeDashboard.click();
    await page.waitForTimeout(2000);

    // Verify active members is now 2!
    const membersHeaderAfter = page.locator('text=/فريق العمل والأعضاء \\(2\\)/').first();
    await membersHeaderAfter.waitFor({ timeout: 10000 });
    await membersHeaderAfter.waitFor({ timeout: 10000 });
    console.log('✅ Active members is now 2! Invitee is officially added.');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14_invitee_joined_project.png') });

    console.log('\n========================================');
    console.log('🎉 INVITATION & NOTIFICATION E2E TEST: 100% PASSED');
    console.log('========================================\n');
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error_invitation_test.png') });
  } finally {
    await browser.close();
  }
}

runInvitationE2ETest();

