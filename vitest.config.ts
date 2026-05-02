import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['__tests__/setup/jest-dom.ts'],
    server: { deps: { external: [/^bun:/] } },
  },
});
