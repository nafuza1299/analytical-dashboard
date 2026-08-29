# Row Playwright checks

## Goal
Verify that the `Row` component behaves like a Tailwind-native 12-column grid container with stable gutter, alignment, and responsive layout behavior.

## CLI flow

```bash
npm run dev
```

Then open the local Vite page and inspect the Row example section.

## Suggested checks

- Confirm the row renders as a 12-column grid with the expected `grid-cols-12` class.
- Verify numeric gutters produce symmetric negative margins and consistent column spacing.
- Check tuple gutters (`[horizontal, vertical]`) apply the correct horizontal and vertical padding offsets.
- Inspect alignment variants (`top`, `middle`, `bottom`, `stretch`) visually.
- Check justification variants (`start`, `center`, `space-between`, etc.) distribute columns as expected.
- Verify `wrap={false}` keeps columns in a single dense flow and does not wrap to new rows.
- Test mobile and desktop widths to confirm the width math remains stable at both breakpoints.
