# Modal

A controlled, portal-rendered dialog for confirmations, forms, and focused tasks.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `open` | `boolean` | required | The caller owns visibility. |
| `onOpenChange` | `(open: boolean) => void` | required | Receives `false` for every dismissal route. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | `sm` max-w-sm, `md` max-w-lg, `lg` max-w-2xl. |
| `closeOnOverlayClick` | `boolean` | `true` | Set false for explicit-action flows. |
| `closeOnEscape` | `boolean` | `true` | Set false only when Escape must not abandon the flow. |

## Behavior and accessibility

- Renders into `document.body`, locks body scroll, traps Tab/Shift+Tab focus, and restores focus to the trigger when closed.
- Escape, the backdrop, and the Header close button call `onOpenChange(false)`.
- The panel has `role="dialog"`, `aria-modal="true"`, and Title supplies `aria-labelledby`.
- The Body scrolls within the `max-h-[85vh]` panel, keeping Header and Footer visible.

## Do / Don't

- Do keep it controlled and include `Modal.Title` for its accessible name.
- Do use `sm` for confirmations and `lg` for lengthy content.
- Don't use a modal for routine navigation or inline-worthy content.

## Usage

```tsx
<Modal open={open} onOpenChange={setOpen} size="sm">
  <Modal.Header><Modal.Title>Delete project</Modal.Title></Modal.Header>
  <Modal.Body><p>This action cannot be undone.</p></Modal.Body>
  <Modal.Footer><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button variant="destructive">Delete</Button></Modal.Footer>
</Modal>
```
