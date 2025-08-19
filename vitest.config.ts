/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './__tests__/setup.ts',
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
      ],
    },
  },
})
