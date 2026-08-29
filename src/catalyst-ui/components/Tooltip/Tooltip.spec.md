# Tooltip

Use `Tooltip` for a short, plain-text hint that supplements an already-labelled control. It opens after a short hover delay and on keyboard focus, then closes immediately on mouse leave or blur.

```tsx
<Tooltip content="Copy to clipboard" side="top">
  <Button variant="ghost" iconOnly aria-label="Copy"><CopyIcon /></Button>
</Tooltip>
```

`side` accepts `top`, `right`, `bottom`, or `left` (default `top`); `delay` defaults to 300 ms. The tooltip automatically flips and shifts to remain in the viewport. Its child must be one element that can receive a ref and pointer/focus handlers.

Accessibility: the rendered hint has `role="tooltip"`; its trigger receives `aria-describedby`. Do not put required information solely in a tooltip because touch users may not encounter it.

Use [Popover](../Popover/Popover.spec.md) instead when the floating content contains links, buttons, forms, or any rich interactive content.
