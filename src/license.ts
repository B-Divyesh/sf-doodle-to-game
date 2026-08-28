const PRODUCT = 'doodle-to-game';
const API_BASE = 'https://api.sociobot.in/api/v1';
const TOKEN_KEY = `sb_license:${PRODUCT}`;
const CACHE_KEY = `sb_license_verdict:${PRODUCT}`;
const ONE_DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number; reason?: string }

export const checkoutUrl = `${API_BASE}/products/${PRODUCT}/checkout`;

export const captureReturnedLicense = (): void => {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CACHE_KEY, JSON.stringify({ valid: true, checkedAt: 0 }));
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
};

export const storeLicense = (token: string): void => {
  const clean = token.trim();
  if (!clean) throw new Error('Paste the license from your receipt.');
  localStorage.setItem(TOKEN_KEY, clean);
  localStorage.removeItem(CACHE_KEY);
};

export const clearLicense = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CACHE_KEY);
};

const cachedVerdict = (): Verdict | null => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as Verdict | null; }
  catch { return null; }
};

export const hasOptimisticUnlock = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  const verdict = cachedVerdict();
  return Boolean(token && verdict?.valid);
};

export const verifyLicense = async (force = false): Promise<Verdict | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const cached = cachedVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < ONE_DAY) return cached;
  try {
    const response = await fetch(`${API_BASE}/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('License server unavailable.');
    const body = await response.json() as { valid?: boolean; reason?: string };
    const verdict: Verdict = { valid: body.valid === true, reason: body.reason, checkedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return cached;
  }
};
