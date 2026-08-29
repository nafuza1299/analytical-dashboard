# Skeleton

## Purpose

Use `Skeleton` as a decorative placeholder while content is loading. It uses semantic surface tokens and respects reduced-motion preferences.

## Usage

```tsx
<div aria-busy="true">
  <Skeleton className="w-48" />
  <Skeleton shape="rect" className="mt-3 h-32" />
</div>
```

`shape` accepts `text` (default), `circle`, and `rect`. Give the loading region `aria-busy`; use `label` only when an individual placeholder should be announced.
