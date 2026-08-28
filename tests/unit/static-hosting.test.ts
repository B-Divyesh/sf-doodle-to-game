// @ts-ignore Vitest provides Node's runtime module; the browser app itself needs no Node types.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const config = JSON.parse(readFileSync(new URL('../../public/staticwebapp.config.json', import.meta.url), 'utf8')) as {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string>; rewrite?: string }>;
  responseOverrides: { '404': { rewrite: string; statusCode: number } };
};
const serviceWorkerBuilder = readFileSync(new URL('../../scripts/build-sw.mjs', import.meta.url), 'utf8');

describe('static release response policy', () => {
  it('keeps documents and the service worker revalidating while immutable assets are long-lived', () => {
    expect(config.globalHeaders['Cache-Control']).toBe('public, max-age=0, must-revalidate');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(config.routes.find((route) => route.route === '/sw.js')?.headers?.['Cache-Control']).toBe('public, max-age=0, must-revalidate');
  });

  it('sets the manifest MIME type and browser hardening policies', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('geolocation=()');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  });

  it('keeps navigation documents under their own canonical cache keys', () => {
    expect(serviceWorkerBuilder).toContain("createHash('sha256').update(manifestText)");
    expect(serviceWorkerBuilder).toContain("url.pathname === '/' ? '/index.html'");
    expect(serviceWorkerBuilder).toContain('cache.put(documentKey, copy)');
    expect(serviceWorkerBuilder).not.toContain("cache.put('/index.html', copy)");
  });

  it('does not precache the deployment-only Azure configuration', () => {
    expect(serviceWorkerBuilder).toContain("entry.name === 'staticwebapp.config.json'");
    expect(serviceWorkerBuilder).not.toContain("const shell = ['/staticwebapp.config.json'");
  });

  it('rewrites each product route and serves unknown paths as the designed 404', () => {
    expect(config.routes.find((route) => route.route === '/demo')?.rewrite).toBe('/index.html');
    expect(config.routes.find((route) => route.route === '/privacy')?.rewrite).toBe('/privacy/index.html');
    expect(config.routes.find((route) => route.route === '/terms')?.rewrite).toBe('/terms/index.html');
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  });
});
