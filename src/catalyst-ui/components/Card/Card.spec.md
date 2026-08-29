# Card

Layout primitive for grouping related content. Use when content naturally belongs together and needs a clear visual container without turning into a rigid single-block component.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `padding` | `"none" \| "sm" \| "md"` | `"md"` | Controls the default spacing for standalone cards. `none` removes padding entirely. |
| `interactive` | `boolean` | `false` | Adds hover/focus affordance and pointer cursor for clickable cards. |
| `as` | `"div" \| "article"` | `"div"` | Semantic override. Use `article` for self-contained content. |
| `className` | `string` | `""` | Extra utility classes. Keep to layout or spacing overrides only. |
| `children` | `ReactNode` | — | Any valid content. Use `Card.Header`, `Card.Body`, and `Card.Footer` for structured layouts. |
| ...rest | any native props for the chosen root element | — | Passed through to the underlying element. |

## Variants

- **default** — standard container with border, surface background, rounded corners, and elevation shadow in light mode.
- **interactive** — adds a pointer cursor, subtle hover border/background change, and a visible focus ring for keyboard users.
- **compact / no padding** — `padding="none"` or `padding="sm"` is useful for stat cards, media cards, or content blocks that already manage their own spacing.

## Responsive behavior

- Default spacing is mobile-first: `p-4` on small screens, `sm:p-6` above the `sm` breakpoint.
- `Card.Footer` stacks actions vertically on mobile and becomes a right-aligned row above `sm:`.
- Card itself does not collapse or reflow structurally; it is simply the container. Layout decisions live in the page/grid using it.

## Dark / light mode

Fully automatic — all colors and borders derive from design tokens (`bg-surface`, `border-border`, `shadow-elevation`) which change under `[data-theme="dark"]`. In dark mode, the elevation shadow is intentionally removed and the border remains the main separation cue.

## Do / Don't

- ✅ Do use `Card.Header`, `Card.Body`, and `Card.Footer` when a layout has distinct sections.
- ✅ Do use `padding="none"` for stat cards or image-first cards that already provide their own spacing.
- ✅ Do keep the action row in `Card.Footer` with mobile full-width buttons when needed.
- ❌ Don't add random hard-coded colors or shadows to override the token system.
- ❌ Don't use a single `Card` for every layout pattern when the content needs more semantic grouping.
- ❌ Don't rely on the card container alone for button alignment; use `Card.Footer` for action rows.

## Usage

```tsx
import { Button } from "@/components/Button/Button";
import { Card } from "@/components/Card/Card";

<Card>
  <Card.Header>
    <Card.Title>Team members</Card.Title>
    <Card.Description>Manage who has access</Card.Description>
  </Card.Header>
  <Card.Body>
    <p className="text-sm text-text-muted">
      You have 12 active members across 3 teams.
    </p>
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  </Card.Footer>
</Card>

<Card padding="none" interactive as="article" role="button" tabIndex={0}>
  <img src="/team.jpg" alt="Team" className="h-48 w-full object-cover" />
  <div className="p-4 sm:p-6">
    <p className="text-sm text-text-muted">Operations</p>
    <h3 className="mt-1 text-lg font-semibold text-text">Q3 rollout</h3>
  </div>
</Card>
```
