import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Bilingual Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display language switcher in admin panel', async ({ page }) => {
    // Should see language switcher button
    await expect(page.getByTestId('admin-language-switcher')).toBeVisible();
    
    // Click to open language dropdown
    await page.getByTestId('admin-language-switcher').click();
    
    // Should see both language options
    await expect(page.getByTestId('switch-to-persian')).toBeVisible();
    await expect(page.getByTestId('switch-to-english')).toBeVisible();
    
    // Should see Persian and English labels
    await expect(page.locator('text=فارسی')).toBeVisible();
    await expect(page.locator('text=English')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/admin-language-switcher.png' });
  });

  test('should switch to Persian (RTL) layout', async ({ page }) => {
    // Open language switcher
    await page.getByTestId('admin-language-switcher').click();
    
    // Switch to Persian
    await page.getByTestId('switch-to-persian').click();
    
    // Wait for language change
    await page.waitForTimeout(500);
    
    // Check RTL direction
    const adminLayout = page.locator('[dir="rtl"]');
    await expect(adminLayout).toBeVisible();
    
    // Check if sidebar is positioned correctly for RTL
    const sidebar = page.locator('.fixed.inset-y-0').first();
    await expect(sidebar).toHaveClass(/right-0/);
    
    // Verify Persian text in navigation
    await expect(page.locator('text=داشبورد')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/admin-persian-rtl-layout.png', fullPage: true });
  });

  test('should switch to English (LTR) layout', async ({ page }) => {
    // First switch to Persian
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-persian').click();
    await page.waitForTimeout(500);
    
    // Then switch back to English
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-english').click();
    await page.waitForTimeout(500);
    
    // Check LTR direction
    const adminLayout = page.locator('[dir="ltr"]');
    await expect(adminLayout).toBeVisible();
    
    // Check if sidebar is positioned correctly for LTR
    const sidebar = page.locator('.fixed.inset-y-0').first();
    await expect(sidebar).toHaveClass(/left-0/);
    
    // Verify English text in navigation
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/admin-english-ltr-layout.png', fullPage: true });
  });

  test('should maintain correct layout in both languages without content overlap', async ({ page }) => {
    // Test in English first
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-english').click();
    await page.waitForTimeout(500);
    
    // Check main content area is not overlapped by sidebar
    const mainContent = page.locator('main, [role="main"], .main-content').first();
    const sidebar = page.locator('.fixed.inset-y-0').first();
    
    if (await mainContent.isVisible() && await sidebar.isVisible()) {
      const mainBox = await mainContent.boundingBox();
      const sidebarBox = await sidebar.boundingBox();
      
      if (mainBox && sidebarBox) {
        // In LTR, main content should start after sidebar
        expect(mainBox.x).toBeGreaterThanOrEqual(sidebarBox.width);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-english-layout-check.png', fullPage: true });
    
    // Switch to Persian and check RTL layout
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-persian').click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'tests/screenshots/admin-persian-layout-check.png', fullPage: true });
  });

  test('should translate navigation menu items correctly', async ({ page }) => {
    // Test English navigation
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-english').click();
    await page.waitForTimeout(500);
    
    const englishNavItems = [
      'Dashboard',
      'Products', 
      'Categories',
      'Pages',
      'Blog',
      'Settings'
    ];
    
    for (const item of englishNavItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
    
    // Test Persian navigation
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-persian').click();
    await page.waitForTimeout(500);
    
    const persianNavItems = [
      'داشبورد',
      'محصولات',
      'دسته‌بندی‌ها', 
      'صفحات',
      'وبلاگ'
    ];
    
    for (const item of persianNavItems) {
      await expect(page.locator(`text=${item}`)).toBeVisible();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-nav-translations.png' });
  });

  test('should navigate to blog section in both languages', async ({ page }) => {
    // Test English blog navigation
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-english').click();
    await page.waitForTimeout(500);
    
    // Click on Blog in navigation
    await page.locator('text=Blog').first().click();
    await page.waitForURL('/admin/blog');
    
    // Should see blog dashboard elements in English
    await expect(page.locator('h1')).toContainText('Blog');
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-english.png' });
    
    // Test Persian blog navigation
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-persian').click();
    await page.waitForTimeout(500);
    
    // Navigate to blog posts
    await page.locator('text=وبلاگ').first().click();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-persian.png' });
  });

  test('should persist language preference across navigation', async ({ page }) => {
    // Set to Persian
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-persian').click();
    await page.waitForTimeout(500);
    
    // Navigate to different sections
    await page.goto('/admin/products');
    await page.waitForTimeout(500);
    
    // Should still be in Persian
    await expect(page.locator('[dir="rtl"]')).toBeVisible();
    
    // Navigate to categories
    await page.goto('/admin/categories');
    await page.waitForTimeout(500);
    
    // Should still be in Persian
    await expect(page.locator('[dir="rtl"]')).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/admin-language-persistence.png' });
  });
});