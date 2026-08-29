# Menu Bar Playwright checks

Use these checks to validate the component in the browser.

## Desktop bar — layout & links

1. Start the app with `npm run dev -- --host 0.0.0.0 --port 4173`.
2. Open the page at `http://localhost:4173/`.
3. Confirm the menu bar appears at the top with a border below.
4. Verify the brand element (logo/text) appears on the left.
5. Confirm nav links appear horizontally (Overview, Team, Products).
6. Verify the active link has underline and primary color.
7. Confirm action buttons (theme toggle, Sign up) appear on the right.

## Desktop — dropdown menu

1. Click the Products dropdown trigger.
2. Confirm the menu panel appears below the trigger with a shadow.
3. Verify each menu item is clickable (Analytics, Reports, Insights).
4. Confirm arrow keys (↑↓) navigate through items with visual highlight.
5. Press Enter on a highlighted item and confirm the menu closes.
6. Press Escape and confirm the menu closes.
7. Click outside the menu and confirm it closes.

## Mobile — hamburger & sheet

1. Resize the viewport to mobile width (for example `375x812`).
2. Confirm nav links are hidden and a hamburger button appears in the Actions area.
3. Click the hamburger to open the mobile sheet.
4. Confirm the sheet slides down from the top with a backdrop.
5. Verify nav links are visible inside the sheet (Overview, Team, Products).
6. Press Escape and confirm the sheet closes.
7. Click the backdrop and confirm the sheet closes.
8. Open the sheet again and confirm it has a focus trap (Tab loops within the sheet).

## Visual checks

- Verify both light and dark mode render with expected contrast.
- Confirm focus ring appears for keyboard-only focus on dropdown triggers and links.
- Ensure dropdown panel has proper shadow and sits above content without layout shift.
- Verify active link underline is clear and matches the primary color token.
- Confirm mobile sheet overlay backdrop is semi-transparent and clickable.
