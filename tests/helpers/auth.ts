import { Page, expect } from '@playwright/test';

export class AdminAuthHelper {
  constructor(private page: Page) {}

  async login(password: string = 'admin123') {
    // Navigate to admin page
    await this.page.goto('/admin');
    
    // Check if we're already authenticated (bypass enabled or already logged in)
    const passwordInput = this.page.getByTestId('admin-password-input');
    
    if (await passwordInput.isVisible()) {
      // Fill in the password
      await passwordInput.fill(password);
      
      // Click login button
      await this.page.getByTestId('admin-login-button').click();
      
      // Wait for redirect to admin dashboard
      await this.page.waitForURL('/admin');
      
      // Verify we're on the dashboard
      await expect(this.page.getByTestId('admin-dashboard-title')).toBeVisible();
    }
  }

  async logout() {
    // Look for logout button in the admin layout
    const logoutButton = this.page.locator('[data-testid="admin-logout"], button:has-text("Logout"), button:has-text("Log Out")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Wait for redirect to login page
      await this.page.waitForURL('/admin');
      
      // Verify we see the login form
      await expect(this.page.getByTestId('admin-password-input')).toBeVisible();
    }
  }

  async ensureAuthenticated() {
    // Check if we're on the login page
    const currentUrl = this.page.url();
    if (currentUrl.includes('/admin')) {
      const passwordInput = this.page.getByTestId('admin-password-input');
      if (await passwordInput.isVisible()) {
        await this.login();
      }
    } else {
      await this.login();
    }
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}

export async function setupAdminTest(page: Page) {
  const auth = new AdminAuthHelper(page);
  await auth.ensureAuthenticated();
  return auth;
}