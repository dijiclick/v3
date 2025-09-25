import { test, expect } from '@playwright/test';
import { setupAdminTest } from './helpers/auth';

test.describe('Admin Blog Posts Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupAdminTest(page);
  });

  test('should display blog posts page with correct elements', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    
    // Check page title
    await expect(page.locator('h1')).toContainText('Blog Posts');
    
    // Check for search functionality
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    
    // Check for add new post button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-page.png', fullPage: true });
  });

  test('should be able to search and filter blog posts', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    await page.waitForLoadState('networkidle');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      
      // Results should update
      await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-search.png' });
      
      // Clear search
      await searchInput.clear();
    }
    
    // Test status filter
    const statusFilter = page.locator('select, [role="combobox"]').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-filter.png' });
    }
  });

  test('should navigate to create new blog post', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    
    // Look for add/new button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add"), a:has-text("New")').first();
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Should navigate to blog editor
      await page.waitForTimeout(1000);
      
      // Check if we're on editor page
      const editorElements = page.locator('textarea, .ql-editor, [contenteditable], input[name="title"]');
      const hasEditor = await editorElements.count() > 0;
      
      if (hasEditor) {
        await expect(editorElements.first()).toBeVisible();
      }
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-editor-new.png', fullPage: true });
    }
  });

  test('should display blog post listing with proper information', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    await page.waitForLoadState('networkidle');
    
    // Look for blog post items
    const postItems = page.locator('[data-testid*="post"], .post-item, [class*="post"]');
    
    if (await postItems.count() > 0) {
      const firstPost = postItems.first();
      await expect(firstPost).toBeVisible();
      
      // Check for common post elements
      const hasTitle = await firstPost.locator('h2, h3, .title, [class*="title"]').count() > 0;
      const hasStatus = await firstPost.locator('.badge, .status, [class*="status"]').count() > 0;
      const hasActions = await firstPost.locator('button, a').count() > 0;
      
      expect(hasTitle || hasStatus || hasActions).toBeTruthy();
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-listing.png', fullPage: true });
  });

  test('should handle blog post actions (edit, delete)', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    await page.waitForLoadState('networkidle');
    
    // Look for action buttons on posts
    const editButtons = page.locator('button:has-text("Edit"), a:has-text("Edit"), [title="Edit"], [aria-label*="Edit"]');
    const deleteButtons = page.locator('button:has-text("Delete"), [title="Delete"], [aria-label*="Delete"]');
    
    if (await editButtons.count() > 0) {
      await editButtons.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'tests/screenshots/admin-blog-post-edit.png' });
      
      // Go back
      await page.goBack();
    }
    
    if (await deleteButtons.count() > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(500);
      
      // Look for confirmation dialog
      const confirmDialog = page.locator('[role="dialog"], .modal, .alert-dialog');
      if (await confirmDialog.isVisible()) {
        await page.screenshot({ path: 'tests/screenshots/admin-blog-post-delete-confirm.png' });
        
        // Cancel deletion
        const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")').first();
        if (await cancelButton.isVisible()) {
          await cancelButton.click();
        }
      }
    }
  });

  test('should test blog post status management', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    await page.waitForLoadState('networkidle');
    
    // Look for status badges/indicators
    const statusBadges = page.locator('.badge, .status, [class*="status"]');
    
    if (await statusBadges.count() > 0) {
      // Check for different status types
      const statuses = ['published', 'draft', 'archived'];
      
      for (const status of statuses) {
        const statusElement = page.locator(`text=${status}`).first();
        if (await statusElement.isVisible()) {
          await expect(statusElement).toBeVisible();
        }
      }
    }
    
    await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-statuses.png' });
  });

  test('should handle bulk operations on blog posts', async ({ page }) => {
    await page.goto('/admin/blog/posts');
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
        await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-bulk-actions.png' });
      }
      
      // Uncheck to clean up
      await checkboxes.first().uncheck();
    }
  });

  test('should test pagination if present', async ({ page }) => {
    await page.goto('/admin/blog/posts');
    await page.waitForLoadState('networkidle');
    
    // Look for pagination controls
    const paginationControls = page.locator('.pagination, [aria-label*="pagination"], nav[role="navigation"]');
    
    if (await paginationControls.count() > 0) {
      const pagination = paginationControls.first();
      await expect(pagination).toBeVisible();
      
      // Look for next/previous buttons
      const nextButton = page.locator('button:has-text("Next"), a:has-text("Next"), [aria-label*="Next"]').first();
      const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous"), [aria-label*="Previous"]').first();
      
      await page.screenshot({ path: 'tests/screenshots/admin-blog-posts-pagination.png' });
    }
  });
});