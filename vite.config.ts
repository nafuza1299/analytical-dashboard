import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
  test: {
    // src/catalyst-ui is copied straight from its own repo, complete with
    // its own Jest-based tests — not meant to run under this project's Vitest.
    exclude: [...configDefaults.exclude, 'src/catalyst-ui/**', 'e2e/**'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    clearMocks: true,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: [...configDefaults.exclude, 'src/catalyst-ui/**', 'src/main.tsx', 'src/**/*.test.{ts,tsx}'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
