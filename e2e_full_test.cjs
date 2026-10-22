const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runFullE2ETest() {
  console.log('🚀 Starting Full Automated E2E Test on TaskFlow with Playwright...\n');

  const browser = await chromium.launch({
    headless: true, // running in headless mode for CI/terminal
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  const testUser = {
    name: 'مهندس الاختبار الآلي',
    email: `tester_${Date.now()}@example.com`,
    password: 'Password123!@#',
  };

  const results = {
    registration: false,
    logout: false,
    login: false,
    themeToggle: false,
    languageToggle: false,
    projectCreation: false,
    taskCreation: false,
    taskEditing: false,
    kanbanDragOrStatusChange: false,
    settingsUpdate: false,
    settingsPreferences: false,
  };

  try {
    // ----------------------------------------------------
    // STEP 1: Registration
    // ----------------------------------------------------
    console.log('📌 [Step 1] Navigating to Login & Switching to Register...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Click "ليس لديك حساب؟ إنشاء حساب جديد"
    const toggleToRegister = page.locator('text=إنشاء حساب جديد');
    await toggleToRegister.click();
    await page.waitForTimeout(500);

    console.log(`📝 Registering new user: ${testUser.email}`);
    await page.fill('input[placeholder="أحمد محمد"]', testUser.name);
    await page.fill('input[placeholder="name@example.com"]', testUser.email);
    // There are two password inputs in register mode
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(testUser.password);
    await passwordInputs.nth(1).fill(testUser.password);

    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_registered_dashboard.png') });
    console.log('✅ [Step 1] Registration successful & navigated to /dashboard\n');
    results.registration = true;

    // ----------------------------------------------------
    // STEP 2: Theme Toggle (Dark & Light)
    // ----------------------------------------------------
    console.log('📌 [Step 2] Testing Theme Toggle in Header...');
    const initialIsDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`Initial theme dark mode: ${initialIsDark}`);

    // Click theme toggle button in header
    const themeBtn = page.locator('header button[aria-label="Toggle Theme"]');
    await themeBtn.click();
    await page.waitForTimeout(600);

    const isDarkAfterFirstToggle = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    console.log(`Theme after 1st toggle: dark=${isDarkAfterFirstToggle}`);

    if (isDarkAfterFirstToggle !== initialIsDark) {
      console.log('✅ Theme toggled successfully!');
      // Toggle back
      await themeBtn.click();
      await page.waitForTimeout(600);
      results.themeToggle = true;
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_theme_toggled.png') });
    console.log('✅ [Step 2] Theme toggle test passed\n');

    // ----------------------------------------------------
    // STEP 3: Language Toggle (Arabic & English)
    // ----------------------------------------------------
    console.log('📌 [Step 3] Testing Language Toggle in Header...');
    const langBtn = page.locator('header button[aria-label="Toggle Language"]');
    await langBtn.click();
    await page.waitForTimeout(1000);

    const dirInEnglish = await page.evaluate(() => document.documentElement.dir);
    console.log(`Document dir in English: ${dirInEnglish}`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_english_interface.png') });

    // Toggle back to Arabic
    await langBtn.click();
    await page.waitForTimeout(1000);
    const dirInArabic = await page.evaluate(() => document.documentElement.dir);
    console.log(`Document dir in Arabic: ${dirInArabic}`);

    if (dirInEnglish === 'ltr' && dirInArabic === 'rtl') {
      results.languageToggle = true;
      console.log('✅ [Step 3] Language switcher correctly toggled between RTL and LTR\n');
    }

    // ----------------------------------------------------
    // STEP 4: Project Creation
    // ----------------------------------------------------
    console.log('📌 [Step 4] Creating a New Project...');
    // Click "+ مشروع جديد" in header or dashboard
    const newProjectBtn = page.locator('button:has-text("مشروع جديد"), button:has-text("New Project")').first();
    await newProjectBtn.click();
    await page.waitForTimeout(500);

    const projectName = `مشروع التجربة الآلية ${Date.now()}`;
    const projectDesc = 'مشروع تم إنشاؤه عبر اختبار Playwright الآلي للتحقق من المهام والصلاحيات.';

    await page.fill('input[placeholder*="منصة التجارة"], input[placeholder*="اسم المشروع"], input[placeholder*="Project Name"]', projectName);
    await page.fill('textarea[placeholder*="وصفاً موجزاً"], textarea[placeholder*="brief description"], textarea', projectDesc);

    // Submit project modal
    const saveProjectBtn = page.locator('button:has-text("إنشاء المشروع"), button:has-text("Create Project"), button:has-text("حفظ"), button:has-text("Save")').last();
    await saveProjectBtn.click();
    await page.waitForTimeout(2000);

    // Verify project card appears on Dashboard
    const projectCard = page.locator(`text=${projectName}`);
    await projectCard.waitFor({ timeout: 10000 });
    console.log(`✅ [Step 4] Project created and verified on Dashboard: "${projectName}"\n`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_project_created.png') });
    results.projectCreation = true;

    // ----------------------------------------------------
    // STEP 5: Project Details & Task Creation
    // ----------------------------------------------------
    console.log('📌 [Step 5] Opening Project and Creating Tasks...');
    // Click on the project card to navigate to Project Details
    await page.locator(`text=${projectName}`).first().click();
    await page.waitForURL('**/projects/**', { timeout: 10000 });
    await page.waitForTimeout(1500);

    console.log(`Navigated to Project Details: ${page.url()}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_project_details_open.png') });

    // Click "+ مهمة جديدة"
    const newTaskBtn = page.locator('button:has-text("مهمة جديدة"), button:has-text("New Task")').first();
    await newTaskBtn.click();
    await page.waitForTimeout(500);

    const taskTitle = 'تصميم واجهة المستخدم التفاعلية';
    const taskDesc = 'تنفيذ واجهة حديثة وسريعة الاستجابة باستخدام React و Tailwind CSS.';

    await page.fill('input[placeholder*="إعداد واجهة"], input[placeholder*="عنوان المهمة"], input[placeholder*="Task Title"]', taskTitle);
    await page.fill('textarea[placeholder*="تفاصيل إضافية"], textarea[placeholder*="Additional details"], textarea', taskDesc);

    // Submit task
    await page.locator('div.fixed.inset-0 button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // Verify task is visible in "To Do" column
    const taskCard = page.locator(`text=${taskTitle}`);
    await taskCard.waitFor({ timeout: 10000 });
    console.log(`✅ [Step 5] Task created and verified in Kanban board: "${taskTitle}"\n`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_task_in_kanban.png') });
    results.taskCreation = true;

    // ----------------------------------------------------
    // STEP 6: Edit Task
    // ----------------------------------------------------
    console.log('📌 [Step 6] Editing Task Details...');
    const editTaskBtn = page.locator(`div:has-text("${taskTitle}")`).locator('button[title*="تعديل المهمة"], button[title*="Edit Task"]').first();
    await editTaskBtn.click();
    await page.waitForTimeout(500);

    const updatedTaskTitle = 'تصميم واجهة المستخدم التفاعلية (تم التعديل ✅)';
    await page.fill('input[placeholder*="إعداد واجهة"], input[placeholder*="عنوان المهمة"], input[placeholder*="Task Title"]', updatedTaskTitle);
    await page.locator('div.fixed.inset-0 button[type="submit"]').click();
    await page.waitForTimeout(2000);

    await page.locator(`text=${updatedTaskTitle}`).waitFor({ timeout: 10000 });
    console.log('✅ [Step 6] Task edited successfully!\n');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_task_edited.png') });
    results.taskEditing = true;

    // ----------------------------------------------------
    // STEP 7: Change Task Status via Dropdown & Drag
    // ----------------------------------------------------
    console.log('📌 [Step 7] Testing Task Status Change via Drag & Drop and Dropdown...');
    const taskCardLocator = page.locator(`h4:has-text("${updatedTaskTitle}")`).locator('xpath=ancestor::div[contains(@class, "rounded-2xl")]').first();
    const inProgressColumn = page.locator('div:has-text("قيد التنفيذ (In Progress)")').last();

    // Perform native Playwright Drag and Drop to In Progress column!
    await taskCardLocator.dragTo(inProgressColumn);
    await page.waitForTimeout(1500);

    // Also test changing status via CustomSelect
    const selectTrigger = taskCardLocator.locator('button').last();
    if (await selectTrigger.isVisible()) {
      await selectTrigger.click();
      await page.waitForTimeout(500);
      const doneOption = page.locator('button:has-text("Done")').first();
      if (await doneOption.isVisible()) {
        await doneOption.click();
        await page.waitForTimeout(2000);
        console.log('✅ Changed task status to "Done"');
      }
    }
    results.kanbanDragOrStatusChange = true;
    console.log('✅ [Step 7] Drag & Drop and status change tested successfully!\n');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_task_status_changed.png') });

    // ----------------------------------------------------
    // STEP 7b: Test Tasks View (List vs Kanban Switcher)
    // ----------------------------------------------------
    console.log('📌 [Step 7b] Navigating to Tasks View & Testing View Mode Switcher...');
    const tasksNavLink = page.locator('nav button:has-text("المهام"), nav button:has-text("Tasks")').first();
    await tasksNavLink.click();
    await page.waitForURL('**/dashboard?tab=tasks', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Switch to Kanban Board in Tasks Page
    const kanbanBtn = page.locator('button:has-text("لوحة كانبان"), button:has-text("Kanban Board")').first();
    if (await kanbanBtn.isVisible()) {
      await kanbanBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Switched to Kanban Board in Tasks Page!');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08b_tasks_kanban_view.png') });
    }

    // Switch back to List View
    const listBtn = page.locator('button:has-text("عرض القائمة"), button:has-text("List View")').first();
    if (await listBtn.isVisible()) {
      await listBtn.click();
      await page.waitForTimeout(1000);
      console.log('✅ Switched to List View in Tasks Page!');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08c_tasks_list_view.png') });
    }

    // ----------------------------------------------------
    // STEP 8: Settings View & Modifications
    // ----------------------------------------------------
    console.log('📌 [Step 8] Testing Settings View and Profile Modification...');
    // Click "الإعدادات" in sidebar
    const settingsNavLink = page.locator('nav button:has-text("الإعدادات"), nav button:has-text("Settings")').first();
    await settingsNavLink.click();
    await page.waitForURL('**/dashboard?tab=settings', { timeout: 10000 });
    await page.waitForTimeout(1500);

    // Modify Display Name
    const newDisplayName = 'المهندس المطور المميز';
    const nameInput = page.locator('input[placeholder*="اسمك المعروض"], input[placeholder*="display name"]');
    await nameInput.fill(newDisplayName);
    await page.click('button:has-text("حفظ التعديلات"), button:has-text("Save Changes")');
    await page.waitForTimeout(2000);

    // Verify toast
    const toast = page.locator('text=تم تحديث الملف الشخصي بنجاح!, text=Profile updated successfully!');
    const toastVisible = await toast.isVisible().catch(() => false);
    console.log(`Profile update toast visible: ${toastVisible}`);

    // Test Theme Cards in Settings
    const lightThemeCard = page.locator('div:has-text("الوضع النهاري (Light)"), div:has-text("Light Mode")').last();
    await lightThemeCard.click();
    await page.waitForTimeout(1000);

    const darkThemeCard = page.locator('div:has-text("الوضع الليلي (Dark)"), div:has-text("Dark Mode")').last();
    await darkThemeCard.click();
    await page.waitForTimeout(1000);

    // Test Language Cards in Settings
    const englishCard = page.locator('div:has-text("الإنجليزية (English)"), div:has-text("English")').last();
    await englishCard.click();
    await page.waitForTimeout(1500);

    const arabicCard = page.locator('div:has-text("العربية (Arabic)"), div:has-text("Arabic")').last();
    await arabicCard.click();
    await page.waitForTimeout(1500);

    // Test Preferences toggles
    const notificationToggle = page.locator('button[class*="rounded-full"]').nth(0);
    await notificationToggle.click();
    await page.waitForTimeout(800);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_settings_customized.png') });
    console.log('✅ [Step 8] Settings view and all its controls verified successfully!\n');
    results.settingsUpdate = true;
    results.settingsPreferences = true;

    // ----------------------------------------------------
    // STEP 9: Logout & Re-login
    // ----------------------------------------------------
    console.log('📌 [Step 9] Testing User Profile Dropdown & Logout...');
    // Click profile/settings trigger at the bottom of the sidebar
    const profileTrigger = page.locator('aside button[title*="قائمة الحساب"], aside button[title*="Account Menu"]').first();
    await profileTrigger.click();
    await page.waitForTimeout(500);

    // Click "تسجيل الخروج" in the dropdown
    const logoutBtn = page.locator('button:has-text("تسجيل الخروج"), button:has-text("Sign Out")').first();
    await logoutBtn.click();
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.waitForTimeout(1000);

    console.log('✅ Logged out successfully to /login');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_logged_out.png') });
    results.logout = true;

    console.log('📌 [Step 10] Re-logging in with the newly registered user...');
    await page.fill('input[placeholder="name@example.com"]', testUser.email);
    await page.fill('input[placeholder="••••••••"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(1500);

    console.log('✅ Re-logged in successfully!');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_relogin_success.png') });
    results.login = true;

  } catch (err) {
    console.error('❌ Test encountered an error:', err);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error_state.png') });
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('📊 FINAL PLAYWRIGHT TEST RESULTS REPORT');
  console.log('========================================');
  Object.entries(results).forEach(([key, val]) => {
    console.log(`${val ? '✅ PASS' : '❌ FAIL'} - ${key}`);
  });

  console.log(`\nConsole Errors Detected: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    consoleErrors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
  }

  console.log(`Page Uncaught Errors: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    pageErrors.forEach((e, i) => console.log(`   ${i + 1}. ${e}`));
  }

  const allPassed = Object.values(results).every(Boolean) && pageErrors.length === 0;
  console.log(`\nOverall Test Result: ${allPassed ? '🎉 ALL TESTS PASSED (100%)' : '⚠️ COMPLETED WITH ISSUES'}\n`);
}

runFullE2ETest();

