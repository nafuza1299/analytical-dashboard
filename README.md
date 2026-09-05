# Analytical Dashboard

> Portfolio project by [nafuza1299](https://github.com/nafuza1299). Live: [analytical-dashboard.vercel.app](https://analytical-dashboard.vercel.app/) · Source: [github.com/nafuza1299/analytical-dashboard](https://github.com/nafuza1299/analytical-dashboard) · [MIT License](LICENSE).

A static analytics dashboard over the [World Bank Indicators API](https://api.worldbank.org/v2) — no backend, no API key. Built to demonstrate the parts of a chart dashboard that don't come for free with a charting library — see "What this actually demonstrates" below.

**Stack:** Vite + React 19 + TypeScript, [catalyst-ui](../catalyst-ui) (personal component library) for layout/UI, Recharts, TanStack Query, react-grid-layout, SheetJS, html2canvas-pro + jsPDF.

## Running it

```bash
npm install
npm run dev      # dev server
npm test         # vitest (unit)
npm run test:e2e # playwright (end-to-end, stubs the World Bank API)
npm run build    # typecheck + production build
```

## What this actually demonstrates

Chart dashboards are common in portfolios — the chart library does most of the visible work. What doesn't come for free:

- **Cache-only filter persistence, decoupled from the URL.** Filters are declared once in a registry (`src/filters/registry.ts`) with a `parse`/`serialize` pair and resolve as **cached value (if this page declares that filter) → default**; changing a filter writes straight to `localStorage` (`filters.v1`) and never touches the URL, so navigating between menus never resets countries/year range. Each menu is its own route (`/economy`, `/health`, `/education`, `/environment`) with the active tab as `?tab=` (`src/navigation/router.ts`, `menus.ts`). The Share Page button can additionally opt into a `?filter=` param — the current filter values opaquely base64-encoded — which seeds the cache once on load and then strips itself from the URL, so a shared link reproduces the sender's view without permanently pinning filters to the URL for everyone else. See `src/filters/useFilters.ts` and `src/filters/shareLink.ts`.

- **The pie chart is disabled for non-additive indicators**, not just hidden by default. Summing a *rate* (inflation, life expectancy, % of GDP) across countries is meaningless; summing an *amount* (GDP, population, CO₂ emissions, forest area) isn't. `src/charts/additiveIndicators.ts` is a maintained allowlist — the World Bank API doesn't expose this distinction itself, so getting it right is a modeling decision, not a library feature.

- **Sparse data renders as gaps, never fabricated values.** A missing country/year/indicator combination stays `null` all the way through the pipeline — the line chart breaks the line (`connectNulls={false}`), the bar chart skips the bar, and the table prints an explicit "No data" cell. Nothing gets coerced to zero.

- **Shared links fully round-trip filter state, including malformed ones.** Every filter's `parse()` returns `null` on anything it can't validate, and the app falls back cleanly through the same precedence chain rather than crashing — a `?filter=` token that fails to decode, or decodes to invalid values, just resolves to whatever's cached or default, with zero console errors.

## Build order

The build followed a deliberate sequence, documented step by step in-repo via commit history: fetch layer + null-handling rule first (nothing else starts until the data model is solid), then the filter system verified with plain text before any chart existed, then one real chart end-to-end, then the rest. The draggable grid layout (`react-grid-layout`, `layout.v1` cache) was treated as genuinely optional and built last, per the original plan.

## Known trade-offs

- Recharts' `Pie` (v3.10.1) silently renders zero sectors under React 19 StrictMode in this setup — worked around with `isAnimationActive={false}` (see the comment in `src/charts/IndicatorPieChart.tsx`).
- `catalyst-ui` is vendored directly into `src/catalyst-ui` (not an npm dependency) since it isn't published or built as a library — see the comments in `vite.config.ts` history for why a `file:` dependency was tried and reverted.
