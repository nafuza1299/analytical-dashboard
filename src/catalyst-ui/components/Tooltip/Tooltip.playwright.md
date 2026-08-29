# Tooltip browser checks

1. Run `npm run dev` and open the demo's **Floating content** card.
2. Hover each T/R/B/L control for roughly 300 ms; confirm the hint opens on the requested side, with inverted text/background contrast.
3. Tab to a control and confirm its hint opens; move the pointer away or blur it and confirm it closes.
4. Repeat near a viewport edge and confirm the hint flips or shifts without clipping. Repeat in light and dark themes.
