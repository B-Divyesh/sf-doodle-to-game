import { beforeEach, describe, expect, it, vi } from 'vitest';
import { captureReturnedLicense, checkoutUrl, hasOptimisticUnlock, verifyLicense } from '../../src/license';

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
  removeItem(key: string) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const TOKEN_KEY = 'sb_license:doodle-to-game';
const CACHE_KEY = 'sb_license_verdict:doodle-to-game';

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
  vi.stubGlobal('location', { href: 'https://doodle-to-game.sociobot.in/' });
  vi.stubGlobal('history', { replaceState: vi.fn() });
  vi.restoreAllMocks();
});

describe('release billing endpoint', () => {
  it('defaults checkout to the production Sociobot API', () => {
    expect(checkoutUrl).toBe('https://api.sociobot.in/api/v1/products/doodle-to-game/checkout');
  });

  it('does not unlock an unverified checkout-return token while offline', async () => {
    vi.stubGlobal('location', { href: 'https://doodle-to-game.sociobot.in/?keep=1&license=not-real#maker' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    expect(captureReturnedLicense()).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('not-real');
    expect(localStorage.getItem(CACHE_KEY)).toBeNull();
    expect(hasOptimisticUnlock()).toBe(false);
    expect(await verifyLicense()).toBeNull();
    expect(history.replaceState).toHaveBeenCalledWith({}, '', '/?keep=1#maker');
  });

  it('uses offline optimism only for the exact server-validated token', async () => {
    localStorage.setItem(TOKEN_KEY, 'paid-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ valid: true, reason: 'ok' }), { status: 200 })));

    const verdict = await verifyLicense(true);
    expect(verdict?.valid).toBe(true);
    expect(hasOptimisticUnlock()).toBe(true);

    vi.stubGlobal('location', { href: 'https://doodle-to-game.sociobot.in/?license=different-token' });
    captureReturnedLicense();
    expect(localStorage.getItem(CACHE_KEY)).toBeNull();
    expect(hasOptimisticUnlock()).toBe(false);
  });

  it('strips a blank returned token without replacing a stored license', () => {
    localStorage.setItem(TOKEN_KEY, 'paid-token');
    vi.stubGlobal('location', { href: 'https://doodle-to-game.sociobot.in/?license=%20%20&keep=1' });

    expect(captureReturnedLicense()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('paid-token');
    expect(history.replaceState).toHaveBeenCalledWith({}, '', '/?keep=1');
  });
});
