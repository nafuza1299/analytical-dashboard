# Button Playwright checks

## Goal
Verify the Button component visually and behaviorally matches the design-system contract.

## CLI flow

```bash
npm run dev
```

Then open the local Vite page and inspect the Button demo section.

## Suggested checks

- Confirm the default button renders in the primary variant.
- Verify the secondary, ghost, and destructive variants differ visually as expected.
- Test `loading` state disables click behavior and shows a spinner.
- Check `iconOnly` usage still exposes an accessible `aria-label`.
- Validate keyboard focus ring and mobile touch-target sizing.
- Compare light and dark mode to ensure tokens adapt without raw color overrides.
