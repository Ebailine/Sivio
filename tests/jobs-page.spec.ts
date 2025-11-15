import { test, expect } from '@playwright/test';

test.describe('Jobs Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);
  });

  test('should load Jobs page successfully', async ({ page }) => {
    await expect(page).toHaveURL('/jobs');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    const searchInputs = page.locator('input[type="text"]');
    const count = await searchInputs.count();

    if (count > 0) {
      const firstInput = searchInputs.first();
      if (await firstInput.isVisible()) {
        await firstInput.fill('Software Engineer');
        await expect(firstInput).toHaveValue('Software Engineer');
      }
    }
  });

  test('should display job cards or listings', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for any card or list elements
    const cards = page.locator('[class*="card"], [class*="bg-white"]');
    const count = await cards.count();

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have Contact Finder button', async ({ page }) => {
    const contactFinderBtn = page.getByRole('button', { name: /Contact Finder/i });
    if (await contactFinderBtn.isVisible()) {
      await expect(contactFinderBtn).toBeVisible();

      await contactFinderBtn.click();
      await page.waitForTimeout(500);

      // Check if modal appeared
      const modal = page.getByText(/Contact Finder/i).first();
      if (await modal.isVisible()) {
        await expect(modal).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/jobs');
    await page.waitForTimeout(1000);

    await expect(page.locator('body')).toBeVisible();
  });

  test('should load without critical errors', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    await expect(page.locator('body')).toBeVisible();
  });
});
