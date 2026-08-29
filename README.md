# Analytical Dashboard

A static analytics dashboard over the [World Bank Indicators API](https://api.worldbank.org/v2) — no backend, no API key. Built as a portfolio piece to demonstrate the parts of a chart dashboard that don't come for free with a charting library.

**Stack:** Vite + React 19 + TypeScript, [catalyst-ui](../catalyst-ui) (personal component library) for layout/UI, Recharts, TanStack Query, react-grid-layout, SheetJS, html2canvas-pro + jsPDF.

## Running it

```bash
npm install
npm run dev      # dev server
npm test         # vitest
npm run build    # typecheck + production build
```

## What this actually demonstrates

Chart dashboards are common in portfolios — the chart library does most of the visible work. What doesn't come for free:

- **Filter persistence with a documented rehydration precedence.** Filters are declared once in a registry (`src/filters/registry.ts`) with a scope (`global` vs `page`) and a `parse`/`serialize` pair. On load, each filter resolves in a fixed order: **URL param (if valid) → cached value (if this page declares that filter) → default.** Global filters (countries, year range) persist to `localStorage` under a versioned key (`filters.v1`); page-scoped filters (the active indicator) never do — that's what makes switching tabs feel like switching pages instead of resetting the app. See `src/filters/resolveFilterValue.ts`.

- **The pie chart is disabled for non-additive indicators**, not just hidden by default. Summing a *rate* (inflation, life expectancy, % of GDP) across countries is meaningless; summing an *amount* (GDP, population, CO₂ emissions, forest area) isn't. `src/charts/additiveIndicators.ts` is a maintained allowlist — the World Bank API doesn't expose this distinction itself, so getting it right is a modeling decision, not a library feature.

- **Sparse data renders as gaps, never fabricated values.** A missing country/year/indicator combination stays `null` all the way through the pipeline — the line chart breaks the line (`connectNulls={false}`), the bar chart skips the bar, and the table prints an explicit "No data" cell. Nothing gets coerced to zero.

- **Shared links fully round-trip filter state, including malformed ones.** Every filter's `parse()` returns `null` on anything it can't validate, and the app falls back cleanly through the same precedence chain rather than crashing — a link with `?countries=???&yearRange=garbage` just resolves to whatever's cached or default, with zero console errors.

## Build order

The build followed a deliberate sequence, documented step by step in-repo via commit history: fetch layer + null-handling rule first (nothing else starts until the data model is solid), then the filter system verified with plain text before any chart existed, then one real chart end-to-end, then the rest. The draggable grid layout (`react-grid-layout`, `layout.v1` cache) was treated as genuinely optional and built last, per the original plan.

## Known trade-offs

- Recharts' `Pie` (v3.10.1) silently renders zero sectors under React 19 StrictMode in this setup — worked around with `isAnimationActive={false}` (see the comment in `src/charts/IndicatorPieChart.tsx`).
- `catalyst-ui` is vendored directly into `src/catalyst-ui` (not an npm dependency) since it isn't published or built as a library — see the comments in `vite.config.ts` history for why a `file:` dependency was tried and reverted.
