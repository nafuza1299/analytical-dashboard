# Modal browser checks

1. Run `npm run dev`, open the app, and use **Delete project**.
2. Confirm the modal is centered, the backdrop dims the page, and page scrolling is locked.
3. Press Tab and Shift+Tab repeatedly: focus must stay in the modal. Press Escape and confirm focus returns to the trigger.
4. Reopen it and click the backdrop; it should close. Repeat in light and dark themes.
5. Open **View activity details** and confirm its body scrolls while Header and Footer remain visible on desktop and mobile widths.
