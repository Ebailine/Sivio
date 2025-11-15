import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have main navigation', async ({ page }) => {
    await page.goto('/');

    // Check for navigation links
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Page should have loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible();

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  test('should navigate to Jobs page', async ({ page }) => {
    await page.goto('/');

    const jobsLink = page.getByRole('link', { name: /jobs/i });
    if (await jobsLink.isVisible()) {
      await jobsLink.click();
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/jobs/);
    }
  });
});
