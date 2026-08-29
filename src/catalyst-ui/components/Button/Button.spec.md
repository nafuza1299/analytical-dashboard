# Button

Primary interactive control for triggering actions. Use for form submits,
dialog confirmations, and any single-click action.

## Props

| Prop        | Type                                                        | Default     | Notes                                          |
|-------------|--------------------------------------------------------------|-------------|-------------------------------------------------|
| `variant`   | `"primary" \| "secondary" \| "ghost" \| "destructive"`        | `"primary"` | One primary button per view/section max.        |
| `size`      | `"sm" \| "md" \| "lg"`                                        | `"md"`      | All sizes meet the 44px mobile touch target.     |
| `loading`   | `boolean`                                                     | `false`     | Shows spinner, disables the button, keeps width. |
| `iconOnly`  | `boolean`                                                     | `false`     | Square shape. Requires `aria-label`.             |
| `disabled`  | `boolean`                                                     | `false`     | Standard HTML disabled behavior.                 |
| ...rest     | any native `<button>` prop (`onClick`, `type`, `aria-*`, etc.) | —           | Passed straight through.                         |

## Variants

- **primary** — main call to action. One per section.
- **secondary** — bordered, lower emphasis. Cancel actions, secondary choices.
- **ghost** — no border/fill until hover. Toolbar icons, low-emphasis actions.
- **destructive** — red. Delete/remove/irreversible actions only.

## Responsive behavior

- `sm` size visually shrinks but keeps a `min-h-11` (44px) touch target below the `sm:` breakpoint; above it, the visual and touch size match.
- `md` and `lg` already meet the 44px floor at all breakpoints.
- No layout shift between breakpoints — size is fixed per instance, not responsive per-button.

## Dark / light mode

Fully automatic — all colors derive from tokens (`--color-primary`,
`--color-surface`, etc.) which flip under `[data-theme="dark"]`. Never pass a
raw Tailwind color class (e.g. `bg-blue-600`) to override — it will not
adapt between modes.

## Do / Don't

- ✅ Do use `iconOnly` + `aria-label` for icon-only triggers (e.g. close buttons).
- ✅ Do use `loading` instead of manually swapping children to a spinner.
- ❌ Don't nest a `Button` inside another `Button`.
- ❌ Don't use `destructive` for anything reversible (e.g. "Cancel").
- ❌ Don't override `variant` colors with `className` — add a new variant instead if the system is missing one.

## Usage

```tsx
import { Button } from "@/components/Button/Button";

<Button variant="primary" size="md" onClick={handleSave}>
  Save changes
</Button>

<Button variant="destructive" onClick={handleDelete}>
  Delete project
</Button>

<Button iconOnly variant="ghost" aria-label="Close dialog" onClick={onClose}>
  <XIcon className="h-4 w-4" />
</Button>

<Button variant="primary" loading>
  Saving…
</Button>
```
