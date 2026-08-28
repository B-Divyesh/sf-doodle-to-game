const PRODUCT = 'doodle-to-game';
// A release must never accidentally point customers at the staging checkout.
// Developers can opt into pilot explicitly with VITE_BILLING_API_BASE.
const API_BASE = (import.meta.env.VITE_BILLING_API_BASE || 'https://api.sociobot.in/api/v1').replace(/\/$/, '');
const TOKEN_KEY = `sb_license:${PRODUCT}`;
const CACHE_KEY = `sb_license_verdict:${PRODUCT}`;
const ONE_DAY = 86_400_000;

interface Verdict { valid: boolean; checkedAt: number; token: string; reason?: string }

export const checkoutUrl = `${API_BASE}/products/${PRODUCT}/checkout`;

export const captureReturnedLicense = (): boolean => {
  const url = new URL(location.href);
  const returnedToken = url.searchParams.get('license');
  if (returnedToken === null) return false;
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  const token = returnedToken.trim();
  if (!token) return false;
  const cached = cachedVerdict();
  localStorage.setItem(TOKEN_KEY, token);
  // A checkout return proves only that a token was supplied. Offline access is
  // optimistic only after this exact token has received a valid server verdict.
  if (cached?.token !== token) localStorage.removeItem(CACHE_KEY);
  return true;
};

export const storeLicense = (token: string): void => {
  const clean = token.trim();
  if (!clean) throw new Error('Paste the license from your receipt.');
  const cached = cachedVerdict();
  localStorage.setItem(TOKEN_KEY, clean);
  if (cached?.token !== clean) localStorage.removeItem(CACHE_KEY);
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
  return Boolean(token && verdict?.token === token && verdict.valid);
};

export const verifyLicense = async (force = false): Promise<Verdict | null> => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const cached = cachedVerdict();
  const tokenVerdict = cached?.token === token ? cached : null;
  if (!force && tokenVerdict && Date.now() - tokenVerdict.checkedAt < ONE_DAY) return tokenVerdict;
  try {
    const response = await fetch(`${API_BASE}/products/${PRODUCT}/verify?license=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('License server unavailable.');
    const body = await response.json() as { valid?: boolean; reason?: string };
    const verdict: Verdict = { valid: body.valid === true, reason: body.reason, checkedAt: Date.now(), token };
    localStorage.setItem(CACHE_KEY, JSON.stringify(verdict));
    return verdict;
  } catch {
    return tokenVerdict;
  }
};
