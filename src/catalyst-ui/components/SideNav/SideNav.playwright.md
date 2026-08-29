# Side Nav Playwright checks

Use these checks to validate the component in the browser.

## Desktop rail

1. Start the app with `npm run dev -- --host 0.0.0.0 --port 4173`.
2. Open the page at `http://localhost:4173/`.
3. Confirm the left rail is visible at a desktop width (for example `1200x900`).
4. Verify each item displays a label and icon.
5. Confirm the active item has a stronger background and a left accent border.

## Mobile drawer

1. Resize the viewport to a mobile width (for example `375x812`).
2. Click the hamburger button to open the drawer.
3. Confirm the drawer slides in from the left and the backdrop appears.
4. Press `Escape` once and confirm the drawer closes.
5. Click the backdrop and confirm the drawer closes again.
6. Select a nav item and confirm the active state updates and the drawer closes after selection.

## Visual checks

- Verify focus ring appears for keyboard-only focus.
- Confirm both light and dark mode render with the expected text contrast.
- Ensure the desktop rail never overlays content; the mobile drawer is the only overlay state.
