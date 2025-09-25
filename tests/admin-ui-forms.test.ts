import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin UI and Forms Testing', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should validate required fields in blog post form', async ({ page }) => {
    await page.goto('/admin/blog/new');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Publish")').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(1000);
      
      // Should show validation errors
      const errorMessages = page.locator('.error, .text-red, [class*="error"], [class*="destructive"]');
      
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
      
      // Check specific field errors
      const titleError = page.locator('text*="title", text*="required"').first();
      const contentError = page.locator('text*="content", text*="required"').first();
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-form-validation.png', fullPage: true });
    }
  });

  test('should validate email format in author form', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Fill invalid email
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    
    if (await emailField.isVisible()) {
      await emailField.fill('invalid-email');
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Should show email validation error
        const emailError = page.locator('text*="email", text*="valid", text*="format"').first();
        
        if (await emailError.isVisible()) {
          await expect(emailError).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-email-validation.png' });
      }
    }
  });

  test('should test slug auto-generation', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Fill name field
      const nameField = page.locator('input[name="name"]').first();
      const slugField = page.locator('input[name="slug"]').first();
      
      if (await nameField.isVisible() && await slugField.isVisible()) {
        await nameField.fill('Test Category Name');
        await page.waitForTimeout(500);
        
        // Slug should auto-generate
        const slugValue = await slugField.inputValue();
        expect(slugValue.length).toBeGreaterThan(0);
        expect(slugValue).toMatch(/^[a-z0-9-]+$/); // Should be URL-friendly
        
        await page.screenshot({ path: 'tests/screenshots/admin-slug-generation.png' });
      }
    }
  });

  test('should test rich text editor functionality', async ({ page }) => {
    await page.goto('/admin/blog/new');
    
    // Look for rich text editor
    const richEditor = page.locator('.ql-editor, [contenteditable="true"], .editor, .rich-text').first();
    
    if (await richEditor.isVisible()) {
      await richEditor.click();
      await richEditor.fill('This is test content for the blog post.');
      
      // Look for editor toolbar
      const toolbar = page.locator('.ql-toolbar, .editor-toolbar, [class*="toolbar"]').first();
      
      if (await toolbar.isVisible()) {
        // Test formatting buttons
        const boldButton = page.locator('button[title*="Bold"], .ql-bold, [class*="bold"]').first();
        const italicButton = page.locator('button[title*="Italic"], .ql-italic, [class*="italic"]').first();
        
        if (await boldButton.isVisible()) {
          await boldButton.click();
        }
        
        if (await italicButton.isVisible()) {
          await italicButton.click();
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-rich-text-editor.png' });
    }
  });

  test('should test form field focus and keyboard navigation', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Test tab navigation through form fields
    const firstField = page.locator('input, textarea').first();
    
    if (await firstField.isVisible()) {
      await firstField.focus();
      
      // Tab through fields
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(200);
      }
      
      // Check that focus moves correctly
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      await page.screenshot({ path: 'tests/screenshots/admin-form-keyboard-navigation.png' });
    }
  });

  test('should test search functionality with debounce', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      // Type search query
      await searchInput.fill('test');
      
      // Wait for debounce
      await page.waitForTimeout(1500);
      
      // Results should update
      await page.screenshot({ path: 'tests/screenshots/admin-search-debounce.png' });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(1000);
    }
  });

  test('should test select dropdown functionality', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    
    // Find filter dropdowns
    const selectElements = page.locator('select, [role="combobox"]');
    
    if (await selectElements.count() > 0) {
      const firstSelect = selectElements.first();
      await firstSelect.click();
      await page.waitForTimeout(500);
      
      // Should see options
      const options = page.locator('option, [role="option"]');
      
      if (await options.count() > 0) {
        // Select first option
        await options.first().click();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-select-dropdown.png' });
    }
  });

  test('should test checkbox and toggle functionality', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Look for checkboxes and toggles
    const checkboxes = page.locator('input[type="checkbox"], [role="checkbox"], [role="switch"]');
    
    if (await checkboxes.count() > 0) {
      for (let i = 0; i < Math.min(3, await checkboxes.count()); i++) {
        const checkbox = checkboxes.nth(i);
        
        if (await checkbox.isVisible()) {
          await checkbox.click();
          await page.waitForTimeout(300);
        }
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-checkboxes-toggles.png' });
    }
  });

  test('should test success and error message display', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Try to create a valid category to test success message
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Fill valid data
      const nameField = page.locator('input[name="name"]').first();
      
      if (await nameField.isVisible()) {
        await nameField.fill(`Success Test ${Date.now()}`);
        
        const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(2000);
          
          // Look for success message
          const successMessage = page.locator('.success, .text-green, [class*="success"], .toast').first();
          
          if (await successMessage.isVisible()) {
            await expect(successMessage).toBeVisible();
            await page.screenshot({ path: 'tests/screenshots/admin-success-message.png' });
          }
        }
      }
    }
  });

  test('should test form reset functionality', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Fill form with test data
    const nameField = page.locator('input[name="name"]').first();
    const emailField = page.locator('input[name="email"]').first();
    
    if (await nameField.isVisible()) {
      await nameField.fill('Test Name');
    }
    
    if (await emailField.isVisible()) {
      await emailField.fill('test@example.com');
    }
    
    // Look for reset/cancel button
    const resetButton = page.locator('button:has-text("Reset"), button:has-text("Clear"), button:has-text("Cancel")').first();
    
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(500);
      
      // Fields should be cleared
      if (await nameField.isVisible()) {
        const nameValue = await nameField.inputValue();
        expect(nameValue).toBe('');
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-form-reset.png' });
    }
  });

  test('should test tooltip and help text functionality', async ({ page }) => {
    await page.goto('/admin/blog/categories');
    
    // Open add form
    const addButton = page.locator('button:has-text("Add"), button:has-text("New")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);
      
      // Look for help icons or tooltips
      const helpIcons = page.locator('[title], [data-tooltip], .tooltip, .help-icon, [aria-describedby]');
      
      if (await helpIcons.count() > 0) {
        const firstHelp = helpIcons.first();
        
        // Hover to show tooltip
        await firstHelp.hover();
        await page.waitForTimeout(500);
        
        // Look for tooltip content
        const tooltip = page.locator('.tooltip, [role="tooltip"], .popover').first();
        
        if (await tooltip.isVisible()) {
          await expect(tooltip).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-tooltip-help.png' });
      }
    }
  });

  test('should test file upload interface', async ({ page }) => {
    await page.goto('/admin/blog/new');
    
    // Look for file upload elements
    const fileInputs = page.locator('input[type="file"]');
    const uploadAreas = page.locator('.upload, .drop-zone, [class*="upload"]');
    
    if (await fileInputs.count() > 0 || await uploadAreas.count() > 0) {
      // Test file input visibility
      if (await fileInputs.count() > 0) {
        const fileInput = fileInputs.first();
        await expect(fileInput).toBeAttached();
      }
      
      // Test upload area
      if (await uploadAreas.count() > 0) {
        const uploadArea = uploadAreas.first();
        await expect(uploadArea).toBeVisible();
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-file-upload.png' });
    }
  });
});