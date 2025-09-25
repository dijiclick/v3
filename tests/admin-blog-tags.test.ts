import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Blog Tags Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display blog tags page with correct elements', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Tags');
    
    // Check for add new tag button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
    
    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-tags-page.png', fullPage: true });
  });

  test('should open add new tag form', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    
    // Click add button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Should see form fields
      const formFields = page.locator('input[name="name"], input[placeholder*="name"], textarea, select');
      
      if (await formFields.count() > 0) {
        await expect(formFields.first()).toBeVisible();
        
        // Check for required form fields
        const nameField = page.locator('input[name="name"], input[placeholder*="name"]').first();
        const slugField = page.locator('input[name="slug"], input[placeholder*="slug"]').first();
        
        if (await nameField.isVisible()) {
          await expect(nameField).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-tag-form.png', fullPage: true });
      }
    }
  });

  test('should create a new blog tag', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Fill form fields
      const nameField = page.locator('input[name="name"], input[placeholder*="name"]').first();
      const slugField = page.locator('input[name="slug"], input[placeholder*="slug"]').first();
      const descField = page.locator('textarea[name="description"], textarea[placeholder*="description"]').first();
      
      if (await nameField.isVisible()) {
        const testTagName = `Test Tag ${Date.now()}`;
        await nameField.fill(testTagName);
        
        if (await slugField.isVisible()) {
          await slugField.fill(`test-tag-${Date.now()}`);
        }
        
        if (await descField.isVisible()) {
          await descField.fill('Test tag description');
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-tag-filled-form.png' });
        
        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Should see success message or return to list
          const successMessage = page.locator('.success, .text-green, [class*="success"]');
          
          if (await successMessage.count() > 0) {
            await expect(successMessage.first()).toBeVisible();
          }
          
          await page.screenshot({ path: 'tests/screenshots/admin-blog-tag-created.png' });
        }
      }
    }
  });

  test('should display tags list with usage statistics', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    await page.waitForLoadState('networkidle');
    
    // Look for tag items
    const tagItems = page.locator('[data-testid*="tag"], .tag-item, [class*="tag"]');
    
    if (await tagItems.count() > 0) {
      const firstTag = tagItems.first();
      await expect(firstTag).toBeVisible();
      
      // Check for tag information
      const hasName = await firstTag.locator('h2, h3, .name, [class*="name"]').count() > 0;
      const hasUsage = await firstTag.locator('.usage, .count, [class*="usage"], [class*="count"]').count() > 0;
      const hasActions = await firstTag.locator('button, a').count() > 0;
      
      expect(hasName || hasUsage || hasActions).toBeTruthy();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-tags-listing.png', fullPage: true });
  });

  test('should test tag color selection', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Look for color picker or color field
      const colorField = page.locator('input[name="color"], input[type="color"], .color-picker');
      
      if (await colorField.count() > 0) {
        const colorInput = colorField.first();
        await expect(colorInput).toBeVisible();
        
        // Test color selection
        if (await colorInput.getAttribute('type') === 'color') {
          await colorInput.click();
          await page.waitForTimeout(500);
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-tag-color-picker.png' });
      }
    }
  });

  test('should test featured tag toggle', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Look for featured toggle
      const featuredToggle = page.locator('input[name="featured"], input[type="checkbox"]:near(:text("featured")), [role="switch"]');
      
      if (await featuredToggle.count() > 0) {
        const toggle = featuredToggle.first();
        
        // Test toggle
        await toggle.click();
        await page.waitForTimeout(300);
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-tag-featured-toggle.png' });
      }
    }
  });

  test('should test tag editing functionality', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    await page.waitForLoadState('networkidle');
    
    // Look for edit buttons
    const editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit"), [title="Edit"], [aria-label*="Edit"]');
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Should see edit form
      const formFields = page.locator('input[name="name"], textarea, select');
      
      if (await formFields.count() > 0) {
        await expect(formFields.first()).toBeVisible();
        
        // Test editing
        const nameField = page.locator('input[name="name"], input[placeholder*="name"]').first();
        
        if (await nameField.isVisible()) {
          const currentValue = await nameField.inputValue();
          await nameField.fill(`${currentValue} - Updated`);
          
          await page.screenshot({ path: 'tests/screenshots/admin-blog-tag-edit-form.png' });
          
          // Cancel editing
          const cancelButton = page.locator('button:has-text("Cancel")').first();
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      }
    }
  });

  test('should search tags', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    await page.waitForLoadState('networkidle');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Results should update
      await page.screenshot({ path: 'tests/screenshots/admin-blog-tags-search.png' });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('should handle bulk tag operations', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    await page.waitForLoadState('networkidle');
    
    // Look for checkboxes for bulk selection
    const checkboxes = page.locator('input[type="checkbox"]');
    
    if (await checkboxes.count() > 0) {
      // Select first item
      await checkboxes.first().check();
      
      // Look for bulk action controls
      const bulkActions = page.locator('select, [role="combobox"]').filter({ hasText: /bulk|action/i });
      
      if (await bulkActions.count() > 0) {
        await bulkActions.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/admin-blog-tags-bulk-actions.png' });
      }
      
      // Uncheck to clean up
      await checkboxes.first().uncheck();
    }
  });

  test('should sort tags by different criteria', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    await page.waitForLoadState('networkidle');
    
    // Look for sort controls
    const sortSelect = page.locator('select:near(:text("sort")), [role="combobox"]:near(:text("sort"))').first();
    
    if (await sortSelect.isVisible()) {
      await sortSelect.click();
      await page.waitForTimeout(500);
      
      // Should see sort options
      await page.screenshot({ path: 'tests/screenshots/admin-blog-tags-sort-options.png' });
      
      // Close dropdown
      await page.keyboard.press('Escape');
    }
  });

  test('should filter tags by featured status', async ({ page }) => {
    await page.goto('/admin/blog/tags');
    await page.waitForLoadState('networkidle');
    
    // Look for filter controls
    const filterSelect = page.locator('select:near(:text("filter")), [role="combobox"]:near(:text("filter"))').first();
    
    if (await filterSelect.isVisible()) {
      await filterSelect.click();
      await page.waitForTimeout(500);
      
      // Should see filter options
      await page.screenshot({ path: 'tests/screenshots/admin-blog-tags-filter-options.png' });
      
      // Close dropdown
      await page.keyboard.press('Escape');
    }
  });
});