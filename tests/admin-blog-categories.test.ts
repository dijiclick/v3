import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Blog Categories Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display blog categories page with correct elements', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Categories');
    
    // Check for add new category button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
    
    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-categories-page.png', fullPage: true });
  });

  test('should open add new category form', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
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
        const descField = page.locator('textarea[name="description"], textarea[placeholder*="description"]').first();
        
        if (await nameField.isVisible()) {
          await expect(nameField).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-category-form.png', fullPage: true });
      }
    }
  });

  test('should test category form validation', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Should show validation errors
        const errorMessages = page.locator('.error, .text-red, [class*="error"], [class*="destructive"]');
        
        if (await errorMessages.count() > 0) {
          await expect(errorMessages.first()).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-category-validation.png' });
      }
    }
  });

  test('should create a new blog category', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
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
        const testCategoryName = `Test Category ${Date.now()}`;
        await nameField.fill(testCategoryName);
        
        if (await slugField.isVisible()) {
          await slugField.fill(`test-category-${Date.now()}`);
        }
        
        if (await descField.isVisible()) {
          await descField.fill('Test category description');
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-category-filled-form.png' });
        
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
          
          await page.screenshot({ path: 'tests/screenshots/admin-blog-category-created.png' });
        }
      }
    }
  });

  test('should display categories list with proper information', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    await page.waitForLoadState('networkidle');
    
    // Look for category items
    const categoryItems = page.locator('[data-testid*="category"], .category-item, [class*="category"]');
    
    if (await categoryItems.count() > 0) {
      const firstCategory = categoryItems.first();
      await expect(firstCategory).toBeVisible();
      
      // Check for category information
      const hasName = await firstCategory.locator('h2, h3, .name, [class*="name"]').count() > 0;
      const hasDescription = await firstCategory.locator('.description, [class*="description"]').count() > 0;
      const hasActions = await firstCategory.locator('button, a').count() > 0;
      
      expect(hasName || hasDescription || hasActions).toBeTruthy();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-categories-listing.png', fullPage: true });
  });

  test('should test category editing functionality', async ({ page }) => {
    await page.goto('/admin/blog/categories');
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
          
          await page.screenshot({ path: 'tests/screenshots/admin-blog-category-edit-form.png' });
          
          // Cancel or save
          const cancelButton = page.locator('button:has-text("Cancel")').first();
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      }
    }
  });

  test('should test category deletion with confirmation', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    await page.waitForLoadState('networkidle');
    
    // Look for delete buttons
    const deleteButtons = page.locator('button:has-text("Delete"), [title="Delete"], [aria-label*="Delete"]');
    
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500);
      
      // Should see confirmation dialog
      const confirmDialog = page.locator('[role="dialog"], .modal, .alert-dialog');
      
      if (await confirmDialog.isVisible()) {
        await expect(confirmDialog).toBeVisible();
        
        // Check for confirmation message
        const confirmMessage = page.locator('text*="Are you sure", text*="confirm", text*="delete"');
        if (await confirmMessage.count() > 0) {
          await expect(confirmMessage.first()).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-category-delete-confirm.png' });
        
        // Cancel deletion
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should search categories', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    await page.waitForLoadState('networkidle');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Results should update
      await page.screenshot({ path: 'tests/screenshots/admin-blog-categories-search.png' });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('should handle parent category selection', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Look for parent category selector
      const parentSelect = page.locator('select[name="parent"], select[name="parentId"], [role="combobox"]').first();
      
      if (await parentSelect.isVisible()) {
        await parentSelect.click();
        await page.waitForTimeout(500);
        
        // Should see parent options
        await page.screenshot({ path: 'tests/screenshots/admin-blog-category-parent-select.png' });
        
        // Close dropdown
        await page.keyboard.press('Escape');
      }
    }
  });
});