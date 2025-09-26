import { test, expect } from '@playwright/test';

test.describe('ChatGPT Product Search', () => {
  test('should find ChatGPT product through comprehensive search', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find the comprehensive search input
    const searchInput = page.getByTestId('comprehensive-search-input');
    await expect(searchInput).toBeVisible();
    
    // Type "ChatGPT" in the search
    await searchInput.fill('ChatGPT');
    
    // Wait for search results to appear
    await page.waitForTimeout(1000); // Give time for debounced search
    
    // Look for ChatGPT product in the results
    const productResult = page.getByTestId('product-result-0'); // First product result
    await expect(productResult).toBeVisible({ timeout: 5000 });
    
    // Verify the result contains ChatGPT
    await expect(productResult).toContainText('ChatGPT', { ignoreCase: true });
    
    // Take a screenshot for verification
    await page.screenshot({ 
      path: 'tests/screenshots/chatgpt-search-results.png',
      fullPage: true 
    });
    
    // Click on the ChatGPT result
    await productResult.click();
    
    // Verify we're redirected to the ChatGPT product page
    await page.waitForURL(/.*chatgpt.*/i, { timeout: 5000 });
    
    // Verify we're on the correct product page
    await expect(page.locator('h1')).toContainText('ChatGPT', { ignoreCase: true });
    
    // Take another screenshot of the product page
    await page.screenshot({ 
      path: 'tests/screenshots/chatgpt-product-page.png',
      fullPage: true 
    });
  });

  test('should find ChatGPT product through blog search', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find the blog search input
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    
    // Type "ChatGPT" in the blog search
    await searchInput.fill('ChatGPT');
    
    // Press Enter to search
    await searchInput.press('Enter');
    
    // Wait for results to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot of blog search results
    await page.screenshot({ 
      path: 'tests/screenshots/chatgpt-blog-search.png',
      fullPage: true 
    });
    
    // Verify that search was performed
    await expect(page.url()).toContain('search=ChatGPT');
  });

  test('should handle English text direction in search', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find the comprehensive search input
    const searchInput = page.getByTestId('comprehensive-search-input');
    await expect(searchInput).toBeVisible();
    
    // Type English text
    await searchInput.fill('ChatGPT Plus');
    
    // Check that the input has LTR direction for English text
    await expect(searchInput).toHaveAttribute('dir', 'ltr');
    
    // Clear and type Persian text
    await searchInput.fill('جستجو');
    
    // Check that the input has RTL direction for Persian text
    await expect(searchInput).toHaveAttribute('dir', 'rtl');
    
    // Take a screenshot showing both directions
    await page.screenshot({ 
      path: 'tests/screenshots/search-text-direction.png',
      fullPage: true 
    });
  });
});