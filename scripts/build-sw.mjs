import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const walk = async (dir, prefix = '') => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'sw.js' || entry.name.endsWith('.map') || entry.name === '.vite' || entry.name === 'staticwebapp.config.json') continue;
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await walk(join(dir, entry.name), relative));
    else files.push(relative);
  }
  return files;
};

const manifestText = await readFile(new URL('../dist/.vite/manifest.json', import.meta.url), 'utf8');
const version = createHash('sha256').update(manifestText).digest('hex').slice(0, 12);
const files = await walk(dist.pathname);
const shell = ['/', ...files.filter((file) => !file.endsWith('.png') || file.includes('icon-192'))];
const source = `const VERSION = 'doodle-${version}';
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => { event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('doodle-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    const documentKey = url.pathname === '/' ? '/index.html' : url.pathname.endsWith('/') ? url.pathname + 'index.html' : url.pathname;
    event.respondWith(fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(VERSION).then(cache => cache.put(documentKey, copy)); } return response; }).catch(async () => (await caches.match(documentKey, { ignoreSearch: true })) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(VERSION).then(cache => cache.put(event.request, copy)); } return response; })));
});`;
await writeFile(new URL('../dist/sw.js', import.meta.url), source);
