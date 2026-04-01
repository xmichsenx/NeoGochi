import { test, expect } from '@playwright/test';

test.describe('NeoGochi E2E - Pet Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the Hatchery page', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('NeoGochi')).toBeVisible();
    await expect(page.getByText('🥚')).toBeVisible();
    await expect(page.getByPlaceholder('Name your pet...')).toBeVisible();
  });

  test('should enable Hatch button only when name and class are selected', async ({ page }) => {
    await page.goto('/');

    const hatchButton = page.getByRole('button', { name: /Hatch/i });
    await expect(hatchButton).toBeDisabled();

    // Enter name
    await page.getByPlaceholder('Name your pet...').fill('TestPet');
    await expect(hatchButton).toBeDisabled();

    // Select class
    await page.getByRole('button', { name: /Chill/i }).click();
    await expect(hatchButton).toBeEnabled();
  });

  test('should create a pet and navigate to Living Room', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Name your pet...').fill('E2EPet');
    await page.getByRole('button', { name: /Chill/i }).click();
    await page.getByRole('button', { name: /Hatch/i }).click();

    // Should redirect to /pet after hatching animation
    await page.waitForURL('**/pet', { timeout: 5000 });
    await expect(page.getByText('NeoGochi')).toBeVisible();
  });

  test('should display pet stats in Living Room', async ({ page }) => {
    // Create a pet first
    await page.goto('/');
    await page.getByPlaceholder('Name your pet...').fill('StatsPet');
    await page.getByRole('button', { name: /Chill/i }).click();
    await page.getByRole('button', { name: /Hatch/i }).click();

    await page.waitForURL('**/pet', { timeout: 5000 });

    // Verify stat bars are displayed
    await expect(page.getByText('hunger')).toBeVisible();
    await expect(page.getByText('happiness')).toBeVisible();
    await expect(page.getByText('energy')).toBeVisible();
    await expect(page.getByText('health')).toBeVisible();
    await expect(page.getByText('cleanliness')).toBeVisible();
  });

  test('should show action buttons in Living Room', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Name your pet...').fill('ActionPet');
    await page.getByRole('button', { name: /Chill/i }).click();
    await page.getByRole('button', { name: /Hatch/i }).click();

    await page.waitForURL('**/pet', { timeout: 5000 });

    // Action buttons should be visible
    await expect(page.getByRole('button', { name: /Feed/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Play/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sleep/i })).toBeVisible();
  });

  test('should have a link to the Graveyard', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Name your pet...').fill('GravePet');
    await page.getByRole('button', { name: /Chill/i }).click();
    await page.getByRole('button', { name: /Hatch/i }).click();

    await page.waitForURL('**/pet', { timeout: 5000 });

    const graveyardLink = page.getByRole('link', { name: /Graveyard/i });
    await expect(graveyardLink).toBeVisible();
  });

  test('should display the Graveyard page', async ({ page }) => {
    await page.goto('/graveyard');

    await expect(page.getByText(/Graveyard/i)).toBeVisible();
  });

  test('should allow selecting all three starting classes', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: /Aggressive/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Chill/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Intellectual/i })).toBeVisible();
  });
});
