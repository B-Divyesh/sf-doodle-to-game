import { expect, test } from '@playwright/test';

test('@claim:sample-demo Demo opens a playable dodge game with sample drawings', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Doodle to Game');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();
  await expect(page.locator('#game-canvas')).toBeVisible();
  await expect(page.getByText('Maya and Theo’s doodle dodge')).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Fresh sample drawings are ready.')).toBeVisible();
  await expect(page.locator('#game-canvas')).toBeVisible();
});

test('@claim:demo-isolation Demo work does not change a real project', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Make another version/ }).click();
  await page.locator('[data-template="maze"]').click();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-template="collect"]')).toHaveAttribute('aria-checked', 'true');
  await page.goto('/?demo=1');
  await expect(page.getByText('Pocket maze')).toBeVisible();
});

test('@claim:local-private Demo drawing and play send no data away from this site', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await page.getByRole('button', { name: /Edit art/ }).click();
  await page.locator('#photo-file').setInputFiles('public/icons/icon-192.png');
  await expect(page.getByText('Photo added locally.')).toBeVisible();
  expect([...origins]).toEqual([new URL(page.url()).origin]);
});

test('@claim:offline-reload Demo works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.ready).active));
  await page.reload();
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('You’re offline — drawing and playing still work.')).toBeVisible();
  await expect(page.locator('#game-canvas')).toBeVisible();
});

test('@claim:saved-browser Game settings save in this browser', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await page.getByLabel('Zippy').check();
  await page.reload();
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await expect(page.getByLabel('Zippy')).toBeChecked();
});

test('@claim:project-export The demo exports a project file', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export project' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^doodle-game-\d{4}-\d{2}-\d{2}\.json$/);
  expect(await file.createReadStream()).toBeTruthy();
});

test('@claim:project-import The demo imports a project file', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#import-file').setInputFiles('tests/fixtures/maze-project.json');
  await expect(page.getByText('Project imported and saved.')).toBeVisible();
  await expect(page.locator('[data-template="maze"]')).toHaveAttribute('aria-checked', 'true');
});

test('@claim:controls The demo game accepts arrows, WASD, and touch controls', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('KeyD');
  await page.getByRole('button', { name: 'Move left' }).click();
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
});

test('@claim:workshop-pack Workshop Pack shows its one-time price and four extra inks', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { name: 'Workshop Pack · US $9 once' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy Workshop Pack' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/doodle-to-game/checkout');
  await page.evaluate(() => {
    localStorage.setItem('sb_license:doodle-to-game', 'test-license');
    localStorage.setItem('sb_license_verdict:doodle-to-game', JSON.stringify({ valid: true, checkedAt: Date.now(), token: 'test-license' }));
  });
  await page.reload();
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await page.getByRole('button', { name: /Edit art/ }).click();
  await expect(page.locator('[data-color]')).toHaveCount(8);
});
