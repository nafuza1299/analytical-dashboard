import { defineConfig, devices } from '@playwright/test'

// Deliberately not 5173: the e2e run must never latch onto whatever the
// developer already has on the default Vite port.
const PORT = 5199

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  // A cold Vite dev server spends several seconds optimizing deps on the
  // first request of a run, which blows the 5s default on every worker.
  expect: { timeout: 15_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
  },
})
