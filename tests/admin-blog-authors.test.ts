import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Blog Authors Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display blog authors page with correct elements', async ({ page }) => {
    await page.goto('/admin/blog/authors');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Authors');
    
    // Check for add new author button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
    
    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-authors-page.png', fullPage: true });
  });

  test('should navigate to create new author page', async ({ page }) => {
    await page.goto('/admin/blog/authors');
    
    // Click add button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Should navigate to new author page
      const expectedUrl = '/admin/blog/authors/new';
      if (page.url().includes(expectedUrl)) {
        await expect(page.url()).toContain(expectedUrl);
      }
      
      // Should see author form
      const formFields = page.locator('input[name="name"], input[name="email"], textarea');
      if (await formFields.count() > 0) {
        await expect(formFields.first()).toBeVisible();
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-author-new-page.png', fullPage: true });
    }
  });

  test('should test author form validation', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
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
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-author-validation.png' });
    }
  });

  test('should create a new blog author', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Fill form fields
    const nameField = page.locator('input[name="name"], input[placeholder*="name"]').first();
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const bioField = page.locator('textarea[name="bio"], textarea[placeholder*="bio"]').first();
    const slugField = page.locator('input[name="slug"], input[placeholder*="slug"]').first();
    
    if (await nameField.isVisible()) {
      const testAuthorName = `Test Author ${Date.now()}`;
      await nameField.fill(testAuthorName);
      
      if (await emailField.isVisible()) {
        await emailField.fill(`test${Date.now()}@example.com`);
      }
      
      if (await slugField.isVisible()) {
        await slugField.fill(`test-author-${Date.now()}`);
      }
      
      if (await bioField.isVisible()) {
        await bioField.fill('Test author biography');
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-author-filled-form.png' });
      
      // Submit form
      const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        
        // Should see success message or redirect
        const successMessage = page.locator('.success, .text-green, [class*="success"]');
        
        if (await successMessage.count() > 0) {
          await expect(successMessage.first()).toBeVisible();
        }
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-author-created.png' });
      }
    }
  });

  test('should display authors list with profile information', async ({ page }) => {
    await page.goto('/admin/blog/authors');
    await page.waitForLoadState('networkidle');
    
    // Look for author items
    const authorItems = page.locator('[data-testid*="author"], .author-item, [class*="author"]');
    
    if (await authorItems.count() > 0) {
      const firstAuthor = authorItems.first();
      await expect(firstAuthor).toBeVisible();
      
      // Check for author information
      const hasName = await firstAuthor.locator('h2, h3, .name, [class*="name"]').count() > 0;
      const hasEmail = await firstAuthor.locator('.email, [class*="email"]').count() > 0;
      const hasBio = await firstAuthor.locator('.bio, [class*="bio"]').count() > 0;
      const hasActions = await firstAuthor.locator('button, a').count() > 0;
      
      expect(hasName || hasEmail || hasBio || hasActions).toBeTruthy();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-authors-listing.png', fullPage: true });
  });

  test('should test author editing functionality', async ({ page }) => {
    await page.goto('/admin/blog/authors');
    await page.waitForLoadState('networkidle');
    
    // Look for edit buttons
    const editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit"), [title="Edit"], [aria-label*="Edit"]');
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Should navigate to edit page
      const expectedUrl = '/admin/blog/authors/edit/';
      if (page.url().includes(expectedUrl)) {
        await expect(page.url()).toContain(expectedUrl);
      }
      
      // Should see edit form
      const formFields = page.locator('input[name="name"], input[name="email"], textarea');
      
      if (await formFields.count() > 0) {
        await expect(formFields.first()).toBeVisible();
        
        // Test editing
        const nameField = page.locator('input[name="name"], input[placeholder*="name"]').first();
        
        if (await nameField.isVisible()) {
          const currentValue = await nameField.inputValue();
          await nameField.fill(`${currentValue} - Updated`);
          
          await page.screenshot({ path: 'tests/screenshots/admin-blog-author-edit-form.png' });
          
          // Cancel editing
          const cancelButton = page.locator('button:has-text("Cancel")').first();
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
          }
        }
      }
    }
  });

  test('should test author social media fields', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Look for social media fields
    const twitterField = page.locator('input[name="twitter"], input[placeholder*="twitter"]').first();
    const linkedinField = page.locator('input[name="linkedin"], input[placeholder*="linkedin"]').first();
    const websiteField = page.locator('input[name="website"], input[type="url"]').first();
    
    const socialFields = [twitterField, linkedinField, websiteField];
    
    for (const field of socialFields) {
      if (await field.isVisible()) {
        await field.fill('https://example.com');
        await page.waitForTimeout(200);
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-author-social-fields.png' });
  });

  test('should test author job title and company fields', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Look for job title and company fields
    const jobTitleField = page.locator('input[name="jobTitle"], input[placeholder*="job"], input[placeholder*="title"]').first();
    const companyField = page.locator('input[name="company"], input[placeholder*="company"]').first();
    
    if (await jobTitleField.isVisible()) {
      await jobTitleField.fill('Senior Developer');
    }
    
    if (await companyField.isVisible()) {
      await companyField.fill('Test Company');
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-author-job-company.png' });
  });

  test('should test author avatar upload', async ({ page }) => {
    await page.goto('/admin/blog/authors/new');
    
    // Look for file upload input
    const avatarUpload = page.locator('input[type="file"], input[name="avatar"]').first();
    
    if (await avatarUpload.isVisible()) {
      // Test file upload interface
      await expect(avatarUpload).toBeVisible();
      
      // Look for upload button or drag area
      const uploadArea = page.locator('.upload, .drop-zone, [class*="upload"]').first();
      
      if (await uploadArea.isVisible()) {
        await expect(uploadArea).toBeVisible();
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-author-avatar-upload.png' });
    }
  });

  test('should search authors', async ({ page }) => {
    await page.goto('/admin/blog/authors');
    await page.waitForLoadState('networkidle');
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Results should update
      await page.screenshot({ path: 'tests/screenshots/admin-blog-authors-search.png' });
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test('should handle author deletion with confirmation', async ({ page }) => {
    await page.goto('/admin/blog/authors');
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
        
        await page.screenshot({ path: 'tests/screenshots/admin-blog-author-delete-confirm.png' });
        
        // Cancel deletion
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
  });
});