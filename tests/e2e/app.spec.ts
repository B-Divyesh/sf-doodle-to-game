import { expect, test } from '@playwright/test';

test('makes two drawings and opens a playable game', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Doodle to Game/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  await page.locator('[data-template="collect"]').click();
  await page.locator('[data-next="draw"]').click();

  const canvas = page.locator('#draw-canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Drawing canvas was not visible');
  await page.mouse.move(box.x + 80, box.y + 90);
  await page.mouse.down();
  await page.mouse.move(box.x + 180, box.y + 170, { steps: 8 });
  await page.mouse.up();
  await page.locator('[data-action="save-art"]').click();
  await expect(page.locator('[data-slot="hero"]')).toContainText('Ready');

  await page.locator('[data-slot="object"]').click();
  const objectCanvas = page.locator('#draw-canvas');
  await objectCanvas.scrollIntoViewIfNeeded();
  const objectBox = await objectCanvas.boundingBox();
  if (!objectBox) throw new Error('Object drawing canvas was not visible');
  await page.mouse.move(objectBox.x + 100, objectBox.y + 100);
  await page.mouse.down();
  await page.mouse.move(objectBox.x + 150, objectBox.y + 180, { steps: 6 });
  await page.mouse.up();
  await page.locator('[data-action="save-art"]').click();
  await page.locator('[data-next="tune"]').click();
  await page.getByLabel('Zippy').check();
  await page.locator('[data-next="play"]').click();
  await expect(page.locator('#game-canvas')).toBeVisible();
  await page.locator('[data-action="start-game"]').click();
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
  expect(consoleErrors).toEqual([]);
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (options: { runOnly: string[] }) => Promise<{ violations: Array<{ impact: string | null; id: string; nodes: unknown[] }> }> } }).axe;
    const results = await axe.run({ runOnly: ['wcag2a', 'wcag2aa'] });
    return results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  });
  expect(violations).toEqual([]);
});

test('has no serious dark-mode accessibility violations', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto('/');
  await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
  const violations = await page.evaluate(async () => {
    const axe = (window as unknown as { axe: { run: (options: { runOnly: string[] }) => Promise<{ violations: Array<{ impact: string | null; id: string; nodes: unknown[] }> }> } }).axe;
    const results = await axe.run({ runOnly: ['wcag2a', 'wcag2aa'] });
    return results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''));
  });
  expect(violations).toEqual([]);
});

test('template radio cards keep roving focus with keyboard selection', async ({ page }) => {
  await page.goto('/');
  const dodge = page.locator('[data-template="dodge"]');
  const collect = page.locator('[data-template="collect"]');
  await dodge.focus();
  await page.keyboard.press('ArrowRight');
  await expect(collect).toBeFocused();
  await expect(collect).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(dodge).toBeFocused();
  await expect(dodge).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Space');
  await expect(dodge).toBeFocused();
});

test('mobile footer links have 44px touch targets', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch target dimensions apply at the 390px layout.');
  await page.goto('/');
  const heights = await page.locator('footer a').evaluateAll((links) => links.map((link) => Math.round(link.getBoundingClientRect().height)));
  expect(heights).toHaveLength(3);
  expect(heights.every((height) => height >= 44)).toBe(true);
});

test('legal pages are reachable without losing app structure', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { name: 'Private by default' })).toBeVisible();
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Private by default' })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByRole('link', { name: /Back to the workshop/ }).click();
  await expect(page.getByRole('heading', { name: /Their drawing/ })).toBeVisible();
});

test('all three fixed game templates start', async ({ page }) => {
  for (const template of ['dodge', 'collect', 'maze']) {
    await page.goto('/');
    await page.locator(`[data-template="${template}"]`).click();
    await page.locator('[data-next="draw"]').click();
    await page.locator('[data-next="tune"]').click();
    await page.locator('[data-next="play"]').click();
    await page.locator('[data-action="start-game"]').click();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#game-score')).not.toHaveText('Ready');
  }
});

test('app shell and saved project remain available offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One offline smoke test is sufficient.');
  await page.goto('/');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/You’re offline/)).toBeVisible();
  await expect(page.locator('[data-template="collect"]')).toBeVisible();
});
