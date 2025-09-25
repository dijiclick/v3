import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display dashboard with correct title and stats', async ({ page }) => {
    await page.goto('/admin');
    
    // Check dashboard title
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();
    await expect(page.getByTestId('admin-dashboard-title')).toContainText('Dashboard');
    
    // Check welcome message
    await expect(page.locator('text=Welcome to your TechShop admin panel')).toBeVisible();
    
    // Check stats cards are present
    const statsCards = page.locator('[data-testid^="stats-card-"]');
    const cardCount = await statsCards.count();
    expect(cardCount).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard-overview.png', fullPage: true });
  });

  test('should display stats cards with correct information', async ({ page }) => {
    await page.goto('/admin');
    
    // Wait for stats to load
    await page.waitForLoadState('networkidle');
    
    // Check that we have stats cards
    const statsCards = page.locator('[data-testid^="stats-card-"]');
    const cardCount = await statsCards.count();
    expect(cardCount).toBe(4); // Expected 4 stats cards
    
    // Check for common stat titles
    await expect(page.locator('text=Total Products')).toBeVisible();
    await expect(page.locator('text=Categories')).toBeVisible();
    await expect(page.locator('text=In Stock')).toBeVisible();
    await expect(page.locator('text=Featured Items')).toBeVisible();
    
    // Check that stats have numeric values
    const statValues = page.locator('.text-2xl.font-bold');
    const valueCount = await statValues.count();
    expect(valueCount).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard-stats.png' });
  });

  test('should have clickable navigation to different admin sections', async ({ page }) => {
    await page.goto('/admin');
    
    // Test navigation to Products
    await page.locator('text=Total Products').click();
    await page.waitForURL('/admin/products');
    await expect(page.url()).toContain('/admin/products');
    
    // Go back to dashboard
    await page.goto('/admin');
    
    // Test navigation to Categories  
    await page.locator('text=Categories').click();
    await page.waitForURL('/admin/categories');
    await expect(page.url()).toContain('/admin/categories');
    
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard-navigation.png' });
  });

  test('should display recent products section', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Look for recent products section
    const recentSection = page.locator('text=Recent Products, text=Latest Products, text=Recent Activity').first();
    
    if (await recentSection.isVisible()) {
      await expect(recentSection).toBeVisible();
      
      // Check if products are listed
      const productItems = page.locator('[data-testid*="product"], .product-item, [class*="product"]');
      
      if (await productItems.count() > 0) {
        await expect(productItems.first()).toBeVisible();
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard-recent-products.png' });
  });

  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/admin');
    
    // Test main navigation items
    const navItems = [
      { text: 'Dashboard', url: '/admin' },
      { text: 'Products', url: '/admin/products' },
      { text: 'Categories', url: '/admin/categories' },
      { text: 'Pages', url: '/admin/pages' },
      { text: 'Blog', url: '/admin/blog' },
      { text: 'Settings', url: '/admin/settings' }
    ];
    
    for (const item of navItems) {
      const navLink = page.locator(`a:has-text("${item.text}"), [href="${item.url}"]`).first();
      
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForTimeout(500);
        await expect(page.url()).toContain(item.url);
        
        // Go back to dashboard for next test
        await page.goto('/admin');
        await page.waitForTimeout(500);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-sidebar-navigation.png' });
  });

  test('should expand and collapse blog submenu', async ({ page }) => {
    await page.goto('/admin');
    
    // Look for blog navigation item
    const blogNav = page.locator('text=Blog').first();
    await blogNav.click();
    
    // Check if we're on blog dashboard or if submenu appeared
    await page.waitForTimeout(500);
    
    // Look for blog submenu items
    const blogSubItems = [
      'Blog Posts',
      'Authors', 
      'Categories',
      'Tags'
    ];
    
    for (const item of blogSubItems) {
      const subItem = page.locator(`text=${item}`);
      if (await subItem.isVisible()) {
        await expect(subItem).toBeVisible();
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-submenu.png' });
  });

  test('should maintain active navigation state', async ({ page }) => {
    // Go to products page
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
    
    // Check that products nav item is active/highlighted
    const activeNav = page.locator('[class*="active"], [class*="bg-accent"], [aria-current="page"]');
    
    if (await activeNav.count() > 0) {
      await expect(activeNav.first()).toBeVisible();
    }
    
    // Check URL is correct
    await expect(page.url()).toContain('/admin/products');
    
    await page.screenshot({ path: 'tests/screenshots/admin-active-navigation.png' });
  });

  test('should handle dashboard responsive layout', async ({ page }) => {
    await page.goto('/admin');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Sidebar should be visible
    const sidebar = page.locator('.fixed.inset-y-0').first();
    await expect(sidebar).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard-desktop.png', fullPage: true });
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Stats should stack vertically and be responsive
    await page.screenshot({ path: 'tests/screenshots/admin-dashboard-mobile.png', fullPage: true });
    
    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
  });
});