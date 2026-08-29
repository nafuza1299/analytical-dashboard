# Card Playwright checks

## Goal
Check the Card component in browser mode for layout, spacing, and interaction states.

## CLI flow

```bash
npm run dev
```

Then open the page where the Card examples are rendered.

## Suggested checks

- Confirm default padding and border styling match the reference design.
- Verify `Card.Header`, `Card.Body`, and `Card.Footer` compose correctly.
- Check interactive cards show a hover/focus treatment without breaking layout.
- Validate `padding="none"` and `padding="sm"` variants resolve expected spacing.
- Review dark mode to ensure surfaces, borders, and shadows still align with tokens.
- Confirm `as="article"` keeps the correct semantic markup for content blocks.
