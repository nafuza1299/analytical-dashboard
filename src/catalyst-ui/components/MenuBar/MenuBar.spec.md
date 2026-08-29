# Menu Bar

Top-level app navigation bar — logo/brand, horizontal nav links, and trailing action area (search, theme toggle, user menu, primary CTA). Built with hybrid slot-based layout and data-driven dropdown menus for maximum flexibility and real-world compatibility.

## Props

| Component | Prop | Type | Default | Notes |
|---|---|---|---|---|
| `MenuBar` | `mobileOpen` | `boolean` | `false` | Controlled state for the mobile sheet. Desktop ignores it. |
| | `onMobileOpenChange` | `(open: boolean) => void` | `undefined` | Updates controlled mobile drawer state, including close requests from backdrop and Escape. |
| | `className` | `string` | `""` | Extra utility classes for layout customization. |
| | `...rest` | native `nav` props | — | Passed through to the `<nav>` element. |
| `MenuBar.Brand` | `className` | `string` | `""` | Extra utility classes for layout. |
| | `children` | `ReactNode` | — | Typically a logo or brand element. Sits at the left of the bar. |
| `MenuBar.Nav` | `className` | `string` | `""` | Extra utility classes. |
| | `children` | `ReactNode` | — | Contains `MenuBar.Link` and/or `MenuBar.Dropdown` components. Hidden below `md:` breakpoint. |
| `MenuBar.Link` | `href` | `string` | `undefined` | If provided, renders as `<a>`; otherwise renders as `<button>`. |
| | `active` | `boolean` | `false` | Visual active state; also sets `aria-current="page"`. |
| | `onClick` | `(e) => void` | `undefined` | Fired on click, works for both `<a>` and `<button>` mode. |
| | `className` | `string` | `""` | Extra utility classes. |
| | `children` | `ReactNode` | — | Link label or icon. |
| | `...rest` | native `<a>` or `<button>` props | — | Passed through. |
| `MenuBar.Dropdown` | `label` | `string` | — | Display text for the trigger button. |
| | `items` | `{ key: string; label: string; href?: string; onSelect?: () => void }[]` | — | Menu items, each with a key, label, optional href, and optional onSelect callback. |
| | `className` | `string` | `""` | Extra utility classes for the container. |
| `MenuBar.Actions` | `className` | `string` | `""` | Extra utility classes. |
| | `children` | `ReactNode` | — | Contains buttons or other interactive elements (theme toggle, primary CTA, etc.). Always visible at all breakpoints. |

## Variants

- **Link vs. Dropdown** — `MenuBar.Link` is for single destinations; `MenuBar.Dropdown` is for grouped menu items with a trigger.
- **Desktop layout** — Brand (left), Nav links/dropdowns (center/left), Actions (right), all inline.
- **Mobile layout** — Brand and Actions stay visible; Nav links collapse into a hamburger sheet.

## Responsive behavior

- **Desktop (`md:` and up)** — horizontal bar, all components visible inline, dropdowns open as floating panels below the trigger.
- **Mobile (below `md:`)** — Nav links hide, hamburger button appears in Actions area, tapping it opens a full-height sheet from the top with the collapsed nav. Dropdowns in the mobile sheet flatten into expandable sections.
- **Actions area** — always visible at all breakpoints (e.g., theme toggle, primary CTA). Responsive gap between items.
- **Dropdowns** — on desktop, open as absolutely-positioned panels; mobile sheet rendering is handled by the host app (see usage example).

## Dark / light mode

All colors derive from semantic tokens (`bg-surface`, `text-primary`, `border-border`, etc.) so they automatically adapt under `[data-theme="dark"]`. The dropdown panel uses `shadow-elevation` for depth, which is especially important in dark mode for floating dropdowns.

## Accessibility

- Root `<nav aria-label="Main">`, following the Side Nav convention.
- `MenuBar.Link` renders as a real `<a>` or `<button>` with proper semantics.
- Active link uses `aria-current="page"`.
- `MenuBar.Dropdown` trigger is a real `<button>` with `aria-haspopup="menu"` and `aria-expanded`.
- Dropdown menu panel has `role="menu"`, items have `role="menuitem"`.
- Arrow keys (↑↓) navigate menu items, Enter/Space select, Escape closes.
- Mobile sheet implements the same focus trap and scroll lock as Side Nav.
- Hamburger button includes `aria-label="Open navigation"` and `aria-expanded`.

## Do / Don't

- ✅ Do use `MenuBar.Link` for single destination links and `MenuBar.Dropdown` for grouped options.
- ✅ Do keep the brand element simple (logo image or text) and let the host app control its `onClick` behavior.
- ✅ Do use `onSelect` callbacks on dropdown items for client-side actions (e.g., open a dialog) and `href` for navigation.
- ✅ Do include a hamburger button in the `Actions` slot on mobile if you want to expose nav in a sheet (see usage).
- ✅ Do close the mobile sheet after nav selection (host app responsibility via `onMobileOpenChange(false)`).
- ❌ Don't nest a `MenuBar.Dropdown` inside another `MenuBar.Dropdown`; flatten hierarchies into separate dropdowns.
- ❌ Don't use the dropdown for more than ~8 items; consider pagination or search if the list is large.
- ❌ Don't rely on hover alone for dropdown interaction; ensure click-to-open works reliably, especially on touch.
- ❌ Don't put interactive elements inside `MenuBar.Brand` that compete with the main navigation flow.

## Usage

```tsx
import { MenuBar } from "@/components/MenuBar/MenuBar";
import { Button } from "@/components/Button/Button";

const [mobileOpen, setMobileOpen] = useState(false);

<MenuBar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}>
  <MenuBar.Brand>
    <img src="/logo.svg" alt="Catalyst" className="h-6" />
  </MenuBar.Brand>

  <MenuBar.Nav>
    <MenuBar.Link href="/overview" active>
      Overview
    </MenuBar.Link>
    <MenuBar.Link href="/team">Team</MenuBar.Link>
    <MenuBar.Dropdown
      label="Products"
      items={[
        { key: "analytics", label: "Analytics", href: "/products/analytics" },
        { key: "reports", label: "Reports", href: "/products/reports" },
      ]}
    />
  </MenuBar.Nav>

  <MenuBar.Actions>
    <Button
      variant="ghost"
      iconOnly
      aria-label="Toggle theme"
      onClick={toggleTheme}
    >
      <SunIcon className="h-4 w-4" />
    </Button>
    <Button variant="primary" size="sm">Sign up</Button>
    {/* Hamburger for mobile */}
    <Button
      variant="ghost"
      iconOnly
      aria-label="Open navigation"
      aria-expanded={mobileOpen}
      onClick={() => setMobileOpen(!mobileOpen)}
      className="md:hidden"
    >
      {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
    </Button>
  </MenuBar.Actions>
</MenuBar>;
```

## Mobile sheet example (with nested nav)

If you want the mobile sheet to include nav items expandable, add them directly to the sheet in the `MenuBar.Nav` component or render them separately:

```tsx
<MenuBar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen}>
  {/* ...brand and actions... */}
  
  {/* Desktop nav */}
  <MenuBar.Nav>
    <MenuBar.Link href="/overview" active>Overview</MenuBar.Link>
  </MenuBar.Nav>
  
  {/* Mobile sheet nav: rendered inside MenuBar's internal drawer */}
  {/* The drawer automatically contains children passed to MenuBar, so 
      you can add nav links directly if needed for mobile layout */}
</MenuBar>;
```
