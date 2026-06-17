import { defineConfig } from 'vitest/config';

// Vitest SOLO para la lógica pura de src/lib (§4): format.ts, horarios.ts.
// Los tests e2e/visual/a11y los corre Playwright (test:e2e), no Vitest.
export default defineConfig({
  test: {
    include: ['src/lib/**/*.test.ts'],
    environment: 'node',
  },
});
