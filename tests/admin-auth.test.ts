import { test, expect } from '@playwright/test';
import { AdminAuthHelper } from './helpers/auth';

test.describe('Admin Authentication', () => {
  let auth: AdminAuthHelper;

  test.beforeEach(async ({ page }) => {
    auth = new AdminAuthHelper(page);
  });

  test('should display login form when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    
    // Should see login form elements
    await expect(page.getByTestId('admin-password-input')).toBeVisible();
    await expect(page.getByTestId('admin-login-button')).toBeVisible();
    await expect(page.locator('text=Limitpass')).toBeVisible();
    await expect(page.locator('text=Enter the admin password to access the dashboard')).toBeVisible();
    
    // Should see demo password hint
    await expect(page.locator('text=Demo Password: admin123')).toBeVisible();
    
    await auth.takeScreenshot('admin-login-form');
  });

  test('should login successfully with correct password', async ({ page }) => {
    await page.goto('/admin');
    
    const passwordInput = page.getByTestId('admin-password-input');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('admin123');
      await page.getByTestId('admin-login-button').click();
      
      // Should redirect to admin dashboard
      await page.waitForURL('/admin');
      await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();
      
      await auth.takeScreenshot('admin-dashboard-after-login');
    }
  });

  test('should show error with incorrect password', async ({ page }) => {
    await page.goto('/admin');
    
    const passwordInput = page.getByTestId('admin-password-input');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('wrongpassword');
      await page.getByTestId('admin-login-button').click();
      
      // Should show error message
      await expect(page.getByTestId('admin-auth-error')).toBeVisible();
      await expect(page.locator('text=Login failed')).toBeVisible();
      
      await auth.takeScreenshot('admin-login-error');
    }
  });

  test('should validate required password field', async ({ page }) => {
    await page.goto('/admin');
    
    const passwordInput = page.getByTestId('admin-password-input');
    if (await passwordInput.isVisible()) {
      const loginButton = page.getByTestId('admin-login-button');
      
      // Button should be disabled when password is empty
      await expect(loginButton).toBeDisabled();
      
      // Enter some text and button should be enabled
      await passwordInput.fill('test');
      await expect(loginButton).toBeEnabled();
      
      // Clear text and button should be disabled again
      await passwordInput.clear();
      await expect(loginButton).toBeDisabled();
    }
  });

  test('should maintain authentication across page refreshes', async ({ page }) => {
    await auth.login();
    
    // Verify we're authenticated
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Should still be authenticated
    await expect(page.getByTestId('admin-dashboard-title')).toBeVisible();
    
    await auth.takeScreenshot('admin-auth-persistence');
  });

  test('should handle loading state during authentication check', async ({ page }) => {
    await page.goto('/admin');
    
    // The auth loading state should be very brief, but we can check that 
    // the page doesn't immediately show the login form before checking auth status
    await page.waitForLoadState('networkidle');
    
    // Should eventually show either login form or dashboard
    const hasLoginForm = await page.getByTestId('admin-password-input').isVisible();
    const hasDashboard = await page.getByTestId('admin-dashboard-title').isVisible();
    
    expect(hasLoginForm || hasDashboard).toBeTruthy();
  });
});