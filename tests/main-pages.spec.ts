import { test, expect } from '@playwright/test';

test.describe('Main Pages Tests', () => {
  test('Features page should load', async ({ page }) => {
    await page.goto('/features');
    await expect(page).toHaveURL('/features');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Pricing page should load', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page).toHaveURL('/pricing');
    await expect(page.locator('body')).toBeVisible();
  });

  test('About page should load', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL('/about');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Blog page should load', async ({ page }) => {
    await page.goto('/blog');
    await expect(page).toHaveURL('/blog');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Help page should load', async ({ page }) => {
    await page.goto('/help');
    await expect(page).toHaveURL('/help');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Changelog page should load', async ({ page }) => {
    await page.goto('/changelog');
    await expect(page).toHaveURL('/changelog');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Contact page should load', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL('/contact');
    await expect(page.locator('body')).toBeVisible();
  });

  test.skip('CRM page should load (requires auth)', async ({ page }) => {
    // Skipping: CRM requires authentication
    await page.goto('/crm');
  });

  test.skip('Dashboard page should load (requires auth)', async ({ page }) => {
    // Skipping: Dashboard requires authentication
    await page.goto('/dashboard');
  });
});

test.describe('Responsive Design Tests', () => {
  const pages = ['/', '/jobs', '/features', '/pricing', '/about'];

  for (const pagePath of pages) {
    test(`${pagePath} should be responsive on mobile`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });

    test(`${pagePath} should be responsive on desktop`, async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
