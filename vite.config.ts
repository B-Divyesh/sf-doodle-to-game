import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    manifest: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        notFound: '404.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html',
      },
    },
  },
});
