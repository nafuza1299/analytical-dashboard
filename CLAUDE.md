# CLAUDE.md

Rules for working in this repo. The [README](README.md) explains *why* the project is
built the way it is; this file is the *how* — the invariants to preserve and the exact
steps for adding a chart, tab, menu, indicator, or filter.

## Stack & commands

Vite + React 19 + TypeScript, Tailwind v4 (token-based `@theme`), Recharts 3,
TanStack Query, react-grid-layout, SheetJS, html2canvas-pro + jsPDF.
Node >= 24 (`.nvmrc`). No backend, no API key — everything is the World Bank public API.

```bash
npm run dev            # vite dev server (also driven by .claude/launch.json)
npm run lint           # oxlint
npm test               # vitest (unit)
npm run test:coverage  # vitest + v8 coverage, 80% gate
npm run test:e2e       # playwright, World Bank API stubbed
npm run build          # tsc -b && vite build
```

## Invariants

These are not style preferences — breaking one produces a wrong dashboard, not just an
inconsistent one.

- **`DataRow` is the only data shape.** Every chart, table, and export consumes
  `DataRow[]` from `src/api/worldBank.ts`. Nothing renders the raw API response, and
  nothing invents a parallel row type.
- **Missing data stays `null`.** Never coerce to `0`, never drop the row. The line chart
  breaks (`connectNulls={false}`), the bar is skipped, the table prints "No data". A
  fabricated zero reads as a real collapse in the data.
- **Colors come from tokens only.** Use `bg-surface`, `text-text-muted`,
  `var(--color-border)` etc. — never `bg-zinc-*` and never a hex literal. The rule is
  stated at the top of `src/catalyst-ui/styles/tokens.css`; it is easiest to break in
  chart code, which styles SVG through inline JS objects. Series colors always come from
  `getSeriesColor(i, total)`, never a hand-picked palette.
- **`src/catalyst-ui/` is vendored and read-only.** It is copied from its own repo (with
  its own Jest tests) and is excluded from Vitest, coverage, and the app tsconfig's test
  glob. Reuse `Card`, `Button`, `Row`/`Col`, `MultiSelect`, `YearRangePicker`; put
  app-specific UI in `src/`, never in there.
- **Shared chart config lives in `src/charts/chartTheme.ts`.** A new chart imports
  `axisTickStyle`, `xAxisTickProps`, `gridStroke`, `legendProps`, `legendItemStyle`,
  `tooltipProps`, `cursorFill`/`cursorLine`, `formatCompact`/`formatFull`,
  `isCurrencyIndicator`, `indicatorSuffix`, `useTooltipCenterY`, `useLegendSelection`,
  `getSeriesColor`. Do not re-declare any of them locally.
- **Three maintained allowlists move together when an indicator is added.** The World Bank
  API exposes none of this, so it cannot be derived:
  - `ADDITIVE_INDICATOR_CODES` in `src/charts/additiveIndicators.ts` — only summable
    amounts (GDP, population, CO₂, forest area) belong here; a rate or percentage in this
    set produces a meaningless share-of-total pie.
  - `CURRENCY_INDICATOR_CODES` in `src/charts/chartTheme.ts` — controls the `$` prefix.
  - `INDICATOR_SUFFIXES` in `src/charts/chartTheme.ts` — `%`, ` yrs`, ` Mt`, ` km²`, …
    Omitting an entry silently renders a unitless number.
- **Filters never touch the URL.** Path = menu, `?tab=` = tab, and that is the whole route
  (`src/navigation/router.ts`, `menus.ts`). Filter values live in `localStorage` under
  `filters.v1`, grid layout under `layout.v1`. The only exception is `?filter=` from a
  share link: read once on load, written to the cache, then stripped from the URL.
- **Every filter `parse()` returns `null` on anything malformed.** Resolution falls back
  cache → default. Nothing throws on a bad share token or a stale cached value.
- **Every `localStorage` access is wrapped in try/catch**, with a comment saying what
  degrades when storage is disabled or full — see `gridLayout.ts` and `useFilters.ts`.
- **Comments explain *why*, especially library workarounds.** Recharts 3.10.1's stuck
  animation/label pipeline, `networkMode: 'always'`, and `useContainerWidth`'s
  measure-once-on-mount trap are all documented at their call sites; keep that up rather
  than leaving a future reader to rediscover them. Deliberate shortcuts with a known
  ceiling are tagged `ponytail:` naming the ceiling and the upgrade path.

## Recipes

### Add an indicator tab

1. Add a `TabDef` (`key`, `label`, `indicatorCode`) to the right `MenuDef` in
   `src/navigation/menus.ts`.
2. Update the three allowlists above for the new indicator code.
3. If it is e2e-covered, add its display name to `INDICATOR_NAMES` in
   `e2e/dashboard.spec.ts`.

No routing changes needed: `resolveRoute` derives menu and tab from the URL, and the tab
strip, the `indicatorLabel()` lookup, and the query key all read from `MENUS`.

### Add a menu

New `MenuDef` in `src/navigation/menus.ts` plus a matching icon in `MENU_ICONS`
(`src/navigation/menuIcons.tsx`). `SideNav` and the `/menu-key?tab=` route follow
automatically.

### Add a chart type

1. New component in `src/charts/`, props `{ rows: DataRow[] }` (add `indicatorCode` only
   if the chart needs it independently of the rows, as `IndicatorPieChart` does).
2. Wrap in `<ResponsiveContainer width="100%" height="100%" minHeight={200}
   onResize={onResize}>` and use the `chartTheme` helpers plus `ChartTooltipContent` for
   the tooltip. Return `null` when there is nothing meaningful to draw.
3. Mount it in `src/App.tsx` inside a `<ChartCard>` wrapped in a `<div key="...">` —
   `ChartCard` supplies the header, drag handle, xlsx export, and PNG capture, so do not
   hand-roll those.
4. **Add the same key to `ITEMS` and `layoutForCols` in `src/layout/gridLayout.ts`.**
   A card with no entry there gets no grid slot at any breakpoint. Sizes are authored per
   breakpoint — react-grid-layout clamps rather than rescales a missing one.

### Reshape rows

Put the transform in its own file next to `pivotByYear.ts` / `latestYearRows.ts` as a pure
function and unit-test it directly. Components stay declarative; no reshaping logic inline.

### Add a filter

1. `FilterDef` in `src/filters/registry.ts` with `serialize`/`parse` (`parse` returns
   `null` on invalid input), then register it in `FILTERS`.
2. Opt the page in via `useFilters([...])` in `src/App.tsx`.
3. Add the control to `src/filters/FiltersBar.tsx`. Controls edit `draft` state and only
   reach `setFilter` on **Apply** — no live-updating filters.

## Testing

- Tests are co-located: `*.test.ts` for pure logic, `*.test.tsx` for components
  (`DataTable` has both, split by concern).
- Vitest + Testing Library on jsdom. `src/test/setup.ts` already stubs `ResizeObserver`,
  `getBoundingClientRect`, `SVGElement.getBBox`, `matchMedia`, clipboard, and
  `createObjectURL` — Recharts renders nothing without them. Do not re-stub per test.
- Assert on Recharts' DOM classes (`.recharts-bar-rectangle`, `.recharts-line`), not
  snapshots.
- Coverage thresholds are enforced in `vite.config.ts`: **80% branches, functions, lines**.
  New code needs tests or the gate fails.
- Playwright stubs `**/api.worldbank.org/**`; e2e never hits the network.
