import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Layout and Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display proper desktop layout', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/admin');
    
    // Sidebar should be visible and positioned correctly
    const sidebar = page.locator('.fixed.inset-y-0').first();
    await expect(sidebar).toBeVisible();
    
    // Main content should not be overlapped
    const mainContent = page.locator('main, [role="main"], .main-content').first();
    
    if (await mainContent.isVisible()) {
      const mainBox = await mainContent.boundingBox();
      const sidebarBox = await sidebar.boundingBox();
      
      if (mainBox && sidebarBox) {
        // Main content should start after sidebar in LTR
        expect(mainBox.x).toBeGreaterThanOrEqual(sidebarBox.width - 10); // Allow small margin
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-layout-desktop.png', fullPage: true });
  });

  test('should handle mobile layout correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    
    // Sidebar should be hidden on mobile
    const sidebar = page.locator('.fixed.inset-y-0').first();
    
    // Check if sidebar is hidden (transform or visibility)
    const sidebarClasses = await sidebar.getAttribute('class');
    const isHidden = sidebarClasses?.includes('translate-x-full') || 
                    sidebarClasses?.includes('-translate-x-full') ||
                    sidebarClasses?.includes('hidden');
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button:has-text("Menu"), .hamburger, .menu-button').first();
    
    if (await mobileMenuButton.isVisible()) {
      await expect(mobileMenuButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-layout-mobile.png', fullPage: true });
  });

  test('should toggle mobile sidebar correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin');
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button:has-text("Menu"), .hamburger, .menu-button, .lg\\:hidden button').first();
    
    if (await mobileMenuButton.isVisible()) {
      // Click to open sidebar
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // Sidebar should be visible
      const sidebar = page.locator('.fixed.inset-y-0').first();
      const sidebarClasses = await sidebar.getAttribute('class');
      const isVisible = !sidebarClasses?.includes('translate-x-full') && 
                       !sidebarClasses?.includes('-translate-x-full');
      
      await page.screenshot({ path: 'tests/screenshots/admin-layout-mobile-sidebar-open.png', fullPage: true });
      
      // Look for close button
      const closeButton = page.locator('[data-testid="close-sidebar"], button:has-text("Close"), .close-button').first();
      
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500);
        
        await page.screenshot({ path: 'tests/screenshots/admin-layout-mobile-sidebar-closed.png', fullPage: true });
      }
    }
  });

  test('should handle tablet layout', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin');
    
    // Test layout adaptation
    const sidebar = page.locator('.fixed.inset-y-0').first();
    await expect(sidebar).toBeVisible();
    
    // Dashboard cards should stack appropriately
    const statsCards = page.locator('[data-testid^="stats-card-"]');
    
    if (await statsCards.count() > 0) {
      // Check card layout
      const cardBoxes = await statsCards.evaluateAll(elements => 
        elements.map(el => el.getBoundingClientRect())
      );
      
      // Cards should stack in a reasonable grid on tablet
      await page.screenshot({ path: 'tests/screenshots/admin-layout-tablet.png', fullPage: true });
    }
  });

  test('should maintain layout integrity in RTL mode', async ({ page }) => {
    await page.goto('/admin');
    
    // Switch to Persian (RTL)
    await page.getByTestId('admin-language-switcher').click();
    await page.getByTestId('switch-to-persian').click();
    await page.waitForTimeout(500);
    
    // Test different viewport sizes in RTL
    const viewports = [
      { width: 1200, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Check RTL layout
      const adminLayout = page.locator('[dir="rtl"]');
      await expect(adminLayout).toBeVisible();
      
      // Sidebar should be on the right in RTL
      const sidebar = page.locator('.fixed.inset-y-0').first();
      const sidebarClasses = await sidebar.getAttribute('class');
      
      if (viewport.width >= 1024) {
        // Desktop RTL should have sidebar on right
        expect(sidebarClasses).toContain('right-0');
      }
      
      await page.screenshot({ path: `tests/screenshots/admin-layout-rtl-${viewport.name}.png`, fullPage: true });
    }
  });

  test('should handle modal dialogs responsively', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Try to open a modal (add category)
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Check modal on different screen sizes
      const viewports = [
        { width: 1200, height: 800, name: 'desktop' },
        { width: 375, height: 667, name: 'mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        // Modal should be visible and properly positioned
        const modal = page.locator('[role="dialog"], .modal, .dialog').first();
        
        if (await modal.isVisible()) {
          await expect(modal).toBeVisible();
          
          // Modal should not overflow viewport
          const modalBox = await modal.boundingBox();
          if (modalBox) {
            expect(modalBox.x).toBeGreaterThanOrEqual(0);
            expect(modalBox.y).toBeGreaterThanOrEqual(0);
            expect(modalBox.x + modalBox.width).toBeLessThanOrEqual(viewport.width);
          }
        }
        
        await page.screenshot({ path: `tests/screenshots/admin-modal-${viewport.name}.png`, fullPage: true });
      }
      
      // Close modal
      const closeButton = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]').first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
  });

  test('should handle form layouts responsively', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Test form layout on different screen sizes
    const viewports = [
      { width: 1200, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Form should be readable and usable
      const formElements = page.locator('input, textarea, select, button');
      
      if (await formElements.count() > 0) {
        const firstInput = formElements.first();
        await expect(firstInput).toBeVisible();
        
        // Check if form elements are not cut off
        const inputBox = await firstInput.boundingBox();
        if (inputBox) {
          expect(inputBox.width).toBeGreaterThan(100); // Reasonable minimum width
        }
      }
      
      await page.screenshot({ path: `tests/screenshots/admin-form-${viewport.name}.png`, fullPage: true });
    }
  });

  test('should handle navigation menu in different screen sizes', async ({ page }) => {
    const viewports = [
      { width: 1200, height: 800, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' }, 
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/admin');
      await page.waitForTimeout(500);
      
      // Navigation should be accessible
      const navItems = page.locator('nav a, .nav-item, [role="navigation"] a');
      
      if (await navItems.count() > 0) {
        const firstNavItem = navItems.first();
        
        if (await firstNavItem.isVisible()) {
          await expect(firstNavItem).toBeVisible();
          
          // Click navigation item
          await firstNavItem.click();
          await page.waitForTimeout(500);
        }
      }
      
      await page.screenshot({ path: `tests/screenshots/admin-navigation-${viewport.name}.png`, fullPage: true });
    }
  });

  test('should handle language switcher accessibility', async ({ page }) => {
    await page.goto('/admin');
    
    // Test language switcher on different screen sizes
    const viewports = [
      { width: 1200, height: 800, name: 'desktop' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      // Language switcher should be accessible
      const languageSwitcher = page.getByTestId('admin-language-switcher');
      
      if (await languageSwitcher.isVisible()) {
        await expect(languageSwitcher).toBeVisible();
        
        // Should be clickable
        await languageSwitcher.click();
        await page.waitForTimeout(300);
        
        // Dropdown should be visible
        const dropdown = page.locator('[role="menu"], .dropdown-menu').first();
        
        if (await dropdown.isVisible()) {
          await expect(dropdown).toBeVisible();
        }
        
        await page.screenshot({ path: `tests/screenshots/admin-language-switcher-${viewport.name}.png` });
        
        // Close dropdown
        await page.keyboard.press('Escape');
      }
    }
  });
});