# Popover

Use `Popover` for controlled, non-modal rich content associated with a trigger. It toggles on trigger click and closes on outside click, Escape, or another trigger click.

```tsx
<Popover open={filtersOpen} onOpenChange={setFiltersOpen} trigger={<Button variant="secondary">Filters</Button>}>
  <form className="space-y-3">...</form>
</Popover>
```

`side` accepts `top`, `right`, `bottom`, or `left` (default `bottom`); `align` accepts `start`, `center`, or `end` (default `start`). The panel flips and shifts to remain in view. Its trigger must be one element that can receive a ref and click handlers.

Accessibility: the trigger exposes `aria-haspopup="dialog"` and `aria-expanded`; the panel has `role="dialog"`. It is intentionally non-modal: background content remains available and focus is not trapped.

Use [Tooltip](../Tooltip/Tooltip.spec.md) instead for a brief, non-interactive text hint. Tooltips are not for clickable content.
