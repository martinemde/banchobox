import { expect, test } from '@playwright/test';

test.describe('navigation', () => {
  test('dishes page renders with expected headers and content', async ({ page }) => {
    await page.goto('/dishes');
    await expect(page).toHaveTitle(/Dishes - Dave Menu/);
    await expect(page.locator('thead')).toContainText('Recipe');
    await expect(page.locator('thead')).toContainText('Base Profit/Serving');
    await expect(page.locator('.card-list .card').first()).toBeVisible();
  });

  test('ingredients page renders with expected headers and content', async ({ page }) => {
    await page.goto('/ingredients');
    await expect(page.locator('h1')).toContainText('All Ingredients');
    await expect(page.locator('thead')).toContainText('Ingredient');
    await expect(page.locator('thead')).toContainText('Cost/kg');
  });

  test('parties page renders with expected headers and content', async ({ page }) => {
    await page.goto('/parties');
    await expect(page.locator('h1')).toHaveText('Parties');
    const firstPartyTableHead = page.locator('.party-card').first().locator('thead');
    await expect(firstPartyTableHead).toContainText('Dish');
    await expect(firstPartyTableHead).toContainText('Revenue');
  });
});
