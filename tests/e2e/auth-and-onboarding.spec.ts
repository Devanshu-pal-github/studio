import { test, expect } from '@playwright/test';

test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

test('signup -> onboarding -> profile responses tab visible', async ({ page }) => {
  const email = `user${Date.now()}@test.com`;

  await page.goto('/signup');
  await page.fill('input[name="name"]', 'E2E User');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'password');
  await page.fill('input[name="confirmPassword"]', 'password');
  await page.click('button[type="submit"]');

  // Should redirect to onboarding after auth
  await page.waitForURL(/\/onboarding/);

  // Say something brief to advance one step
  await page.fill('input[placeholder="Type your response..."]', 'Hi there, excited to learn!');
  await page.click('button[type="submit"]');

  // We won't wait for full flow; just navigate to profile and see tabs rendered
  await page.goto('/profile');
  await expect(page.getByText('Onboarding Responses')).toBeVisible();
});
