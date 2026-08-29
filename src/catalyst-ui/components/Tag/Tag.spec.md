# Tag

A compact, pill-shaped label for categories, statuses, and metadata. Tags are
informational by default; use the dismissible variant only for removable values
such as active filters.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `color` | `"blue" \| "green" \| "amber" \| "red" \| "purple" \| "gray"` | `"gray"` | Fixed categorical palette; do not pass arbitrary colors. |
| `size` | `"sm" \| "md"` | `"md"` | `sm` is for dense layouts such as table cells. |
| `icon` | `ReactNode` | — | Small decorative leading icon or status dot. |
| `dismissible` | `boolean` | `false` | Adds a remove button; requires `onDismiss`. |
| `onDismiss` | `() => void` | — | Called when the remove button is clicked. |
| `...rest` | native `<span>` props | — | Includes `className` and `aria-*` attributes. |

## Color reference

| Color | Suggested use |
|---|---|
| `blue` | Product area, platform, or informational category |
| `green` | Active, complete, healthy |
| `amber` | Pending, warning, needs attention |
| `red` | Bug, blocked, error |
| `purple` | Feature, initiative, or secondary category |
| `gray` | Neutral metadata |

Pick colors by convention within your app (for example, always use red for
bugs). The component renders color; it does not enforce meaning.

## Size and behavior

- `sm`: `h-5 px-2 text-xs`; use in dense lists and tables.
- `md`: `h-6 px-2.5 text-sm`; the default for general metadata.
- Tags are `rounded-full`, intentionally distinct from buttons and cards.
- There are no responsive variants. Place multiple tags in a parent with
  `flex flex-wrap gap-2` to wrap naturally.
- Static tags render as a `<span>` and are not focusable. A dismissible tag has
  an independent real button with an accessible “Remove {label} tag” name.

## Do / Don't

- Do use a visible label; color reinforces meaning but never replaces it.
- Do reserve dismissible tags for values users can remove.
- Don't use a Tag as a button or filter toggle.
- Don't override its categorical colors with raw Tailwind palette classes.

## Usage

```tsx
import { Tag } from "@/components/Tag/Tag";

<Tag color="blue">Frontend</Tag>
<Tag color="green" size="sm">Active</Tag>
<Tag color="red" dismissible onDismiss={() => removeTag(id)}>
  Bug
</Tag>
```
