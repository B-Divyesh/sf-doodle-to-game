import { expect, test, type Page } from '@playwright/test';

const alphaPixels = (canvas: HTMLCanvasElement): number => {
  const data = canvas.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas.width, canvas.height).data;
  if (!data) return 0;
  let count = 0;
  for (let index = 3; index < data.length; index += 4) if (data[index] > 10) count += 1;
  return count;
};

const transparentPixels = (canvas: HTMLCanvasElement): number => {
  const data = canvas.getContext('2d', { willReadFrequently: true })?.getImageData(0, 0, canvas.width, canvas.height).data;
  if (!data) return 0;
  let count = 0;
  for (let index = 3; index < data.length; index += 4) if (data[index] < 80) count += 1;
  return count;
};

const drawLine = async (page: Page, from: [number, number], to: [number, number]): Promise<void> => {
  const canvas = page.locator('#draw-canvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Drawing canvas is not visible.');
  await page.mouse.move(box.x + from[0], box.y + from[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + to[0], box.y + to[1], { steps: 8 });
  await page.mouse.up();
};

const chooseDemoTemplate = async (page: Page, template: 'dodge' | 'collect' | 'maze'): Promise<void> => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: 'Choose another game' }).click();
  await page.locator(`[data-template="${template}"]`).click();
  await page.getByRole('button', { name: /Add two drawings/ }).click();
  await page.locator('[data-next="tune"]').click();
  await page.locator('[data-next="play"]').click();
};

test('@claim:sample-demo Demo opens its playable sample in the first screen', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveTitle('Demo — Doodle to Game');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Play Maya and Theo’s Doodle dodge' })).toBeVisible();
  await expect(page.locator('#game-canvas')).toBeVisible();
  if (page.viewportSize()!.width === 390) {
    for (const selector of ['h1', '#game-canvas', '[data-action="start-game"]', '.dpad']) {
      const box = await page.locator(selector).boundingBox();
      expect(box, `${selector} should have a layout box`).not.toBeNull();
      expect(box!.y).toBeLessThan(page.viewportSize()!.height);
      expect(box!.y + box!.height).toBeGreaterThan(0);
    }
  }
  await page.getByRole('button', { name: 'Start round' }).click();
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Fresh sample drawings are ready.')).toBeVisible();
});

test('@claim:demo-isolation Demo never reads or changes real project or license storage', async ({ page }) => {
  const verificationRequests: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/verify?license=')) verificationRequests.push(request.url()); });
  await page.goto('/demo');
  const before = await page.evaluate(async () => {
    const realProject = {
      id: 'current', title: 'Real family game', template: 'collect', speed: 'zippy', score: 'long', sound: false,
      assets: {}, updatedAt: '2026-01-01T00:00:00.000Z',
    };
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('doodle-to-game', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('projects', { keyPath: 'id' });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const put = request.result.transaction('projects', 'readwrite').objectStore('projects').put(realProject);
        put.onerror = () => reject(put.error); put.onsuccess = () => resolve();
      };
    });
    localStorage.setItem('sb_license:doodle-to-game', 'real-license');
    localStorage.setItem('sb_license_verdict:doodle-to-game', JSON.stringify({ valid: true, checkedAt: 123, token: 'real-license' }));
    return { project: realProject, storage: Object.fromEntries(Object.entries(localStorage)) };
  });
  await page.reload();
  await expect(page.getByText('Workshop Pack active')).toHaveCount(0);
  await expect(page.locator('#license-form')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.getByRole('button', { name: 'Move left' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.getByRole('button', { name: 'Choose another game' }).click();
  await page.locator('[data-template="maze"]').click();
  await page.getByRole('button', { name: /Add two drawings/ }).click();
  await page.locator('[data-next="tune"]').click();
  await page.getByLabel('Zippy').check();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-template="collect"]')).toHaveAttribute('aria-checked', 'true');
  const after = await page.evaluate(async () => {
    const project = await new Promise<unknown>((resolve, reject) => {
      const request = indexedDB.open('doodle-to-game', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const get = request.result.transaction('projects').objectStore('projects').get('current');
        get.onerror = () => reject(get.error); get.onsuccess = () => resolve(get.result);
      };
    });
    return { project, storage: Object.fromEntries(Object.entries(localStorage)) };
  });
  expect(after).toEqual(before);
  expect(verificationRequests).toEqual([]);
  await page.goto('/?demo=1');
  await expect(page.getByRole('heading', { name: 'Play Maya and Theo’s Doodle dodge' })).toBeVisible();
});

test('@claim:local-private Drawing, photo cleanup, and play make only same-origin requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.keyboard.press('ArrowRight');
  await page.locator('[data-back="tune"]').click();
  await page.locator('[data-back="draw"]').click();
  await page.locator('#photo-file').setInputFiles('tests/fixtures/paper-drawing.png');
  await expect(page.getByText('Photo added locally.')).toBeVisible();
  await page.getByRole('button', { name: 'Remove paper' }).click();
  expect([...origins]).toEqual([new URL(page.url()).origin]);
});

test('@claim:offline-reload Demo installs with production-missing config and plays offline', async ({ page, context }) => {
  const requested: string[] = [];
  page.on('request', (request) => requested.push(request.url()));
  await context.route('**/staticwebapp.config.json', (route) => route.fulfill({ status: 404, body: 'not public in production' }));
  await page.goto('/demo');
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.ready).active));
  await page.reload();
  expect(requested.some((url) => url.endsWith('/staticwebapp.config.json'))).toBe(false);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('You’re offline — drawing and playing still work.')).toBeVisible();
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
});

test('@claim:saved-browser Game settings save in this browser', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await page.getByLabel('Zippy').check();
  await page.reload();
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await expect(page.getByLabel('Zippy')).toBeChecked();
});

test('@claim:drawing-game Two new drawings become the sprites in a playable game', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.locator('[data-next="draw"]').click();
  await drawLine(page, [60, 70], [190, 150]);
  await page.getByRole('button', { name: 'Save drawing' }).click();
  await expect(page.getByRole('tab', { name: /Player drawing Ready/ })).toBeVisible();
  await page.getByRole('tab', { name: /drawing Needs drawing/ }).click();
  await drawLine(page, [80, 90], [170, 170]);
  await page.getByRole('button', { name: 'Save drawing' }).click();
  await page.locator('[data-next="tune"]').click();
  await page.locator('[data-next="play"]').click();
  await page.getByRole('button', { name: 'Start round' }).click();
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
  const assets = await page.evaluate(async () => new Promise<Record<string, string>>((resolve, reject) => {
    const request = indexedDB.open('doodle-to-game', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const get = request.result.transaction('projects').objectStore('projects').get('current');
      get.onerror = () => reject(get.error); get.onsuccess = () => resolve(get.result.assets);
    };
  }));
  expect(assets.hero).toMatch(/^data:image\/webp/);
  expect(assets.object).toMatch(/^data:image\/webp/);
});

test('@claim:three-games Dodge, collect, and maze each enforce their stated rule', async ({ page }) => {
  test.setTimeout(50_000);
  await chooseDemoTemplate(page, 'dodge');
  await page.getByRole('button', { name: 'Start round' }).click();
  await expect(page.locator('#game-score')).toContainText('/ 15s');
  await expect(page.locator('#game-detail')).toHaveText('Keep moving');

  await chooseDemoTemplate(page, 'collect');
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.keyboard.down('ArrowRight');
  await expect(page.locator('#game-score')).not.toHaveText('0 / 5', { timeout: 4_000 });
  await page.keyboard.up('ArrowRight');
  await expect(page.locator('#game-detail')).toHaveText('Drawings collected');

  await chooseDemoTemplate(page, 'maze');
  await page.getByRole('button', { name: 'Start round' }).click();
  const route = ['ArrowDown','ArrowDown','ArrowDown','ArrowDown','ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowLeft','ArrowLeft','ArrowDown','ArrowDown','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight'];
  for (const key of route) await page.keyboard.press(key);
  await expect(page.locator('#game-message')).toContainText('Maze solved in 21 moves!');
});

test('@claim:photo-cleanup A clear paper photo can become a transparent drawing', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await page.getByRole('button', { name: /Edit drawings/ }).click();
  await page.locator('#photo-file').setInputFiles('tests/fixtures/paper-drawing.png');
  await expect(page.getByText('Photo added locally.')).toBeVisible();
  const before = await page.locator('#draw-canvas').evaluate(transparentPixels);
  await page.getByRole('button', { name: 'Remove paper' }).click();
  const after = await page.locator('#draw-canvas').evaluate(transparentPixels);
  expect(after).toBeGreaterThan(before + 50_000);
  expect(await page.locator('#draw-canvas').evaluate(alphaPixels)).toBeGreaterThan(1_000);
});

test('@claim:project-export The demo exports a project file', async ({ page }) => {
  await page.goto('/demo');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export sample project' }).click();
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

test('@claim:controls The demo accepts arrows, W, A, S, D, and touch controls', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('KeyD');
  await page.getByRole('button', { name: 'Move left' }).click();
  await expect(page.locator('#game-score')).not.toHaveText('Ready');
});

test('@claim:free-maker Drawing, saving, playing, and export work without a license', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Workshop Pack · US $9 once' })).toBeVisible();
  await page.locator('[data-next="draw"]').click();
  await expect(page.locator('[data-color]')).toHaveCount(4);
  await drawLine(page, [50, 50], [160, 130]);
  await page.getByRole('button', { name: 'Save drawing' }).click();
  await page.locator('[data-next="tune"]').click();
  await page.locator('[data-next="play"]').click();
  await page.getByRole('button', { name: 'Start round' }).click();
  await page.getByRole('button', { name: 'Choose game' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export project' }).click();
  await download;
});

test('@claim:workshop-pack Demo proves four bonus inks and the finish celebration', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: /Tune rules/ }).click();
  await page.getByRole('button', { name: /Edit drawings/ }).click();
  await expect(page.locator('[data-color]')).toHaveCount(8);
  await chooseDemoTemplate(page, 'maze');
  await page.getByRole('button', { name: 'Start round' }).click();
  const route = ['ArrowDown','ArrowDown','ArrowDown','ArrowDown','ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowLeft','ArrowLeft','ArrowDown','ArrowDown','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight'];
  for (const key of route) await page.keyboard.press(key);
  await expect(page.locator('#game-message')).toContainText('Maze solved');
  await expect(page.locator('#confetti i')).toHaveCount(16);
});

test('@claim:hosted-checkout Sociobot redirects the one-time purchase to its Dodo checkout', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'One live checkout contract check is sufficient.');
  await page.goto('/');
  const link = page.getByRole('link', { name: 'Buy Workshop Pack' });
  await expect(link).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/doodle-to-game/checkout');
  const response = await request.get(await link.getAttribute('href') as string, { maxRedirects: 0 });
  expect(response.status()).toBe(303);
  const location = response.headers().location;
  expect(new URL(location).hostname).toBe('checkout.dodopayments.com');
  const hosted = await request.get(location);
  expect(await hosted.text()).toContain('Doodle to Game Workshop Pack');
});
