# Side Nav

Primary navigation for app-shell layouts. Use this for the main navigation rail on desktop and the slide-over drawer on mobile. It stays routing-agnostic by accepting data and a selected key instead of knowing about React Router or Next.js links.

## Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `items` | `{ key: string; label: string; icon?: ReactNode; href?: string }[]` | — | Flat configuration for nav entries. Keeps the component data-driven and easy to render in any routing system. |
| `activeKey` | `string` | `undefined` | The currently active item. The host app decides this from the active route or state. |
| `onSelect` | `(key: string) => void` | `undefined` | Fired when a nav item is activated. Use it to trigger navigation or route updates. |
| `open` | `boolean` | `false` | Controlled drawer state for mobile only. Desktop rail ignores it. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Updates the controlled mobile drawer state, including close requests from backdrop and Escape. |
| `className` | `string` | `""` | Extra layout utility classes if a page needs custom spacing or alignment. |
| `...rest` | native `nav` props | — | Passed through to the desktop nav element and other wrapper elements where applicable. |

## Variants

- **Desktop rail** — always visible at `lg:` and above, fixed-width, no overlay, part of the page layout.
- **Mobile drawer** — hidden below `lg:`, rendered as a fixed position panel that slides in from the left with a backdrop.
- **Active item** — `activeKey` drives the visual active state and `aria-current="page"` on the selected item.

## Responsive behavior

- Desktop mode uses a fixed-width rail (`w-64`) that sits alongside the page content in a flex layout.
- Mobile mode relies on a controlled `open` state instead of a JS media query, which avoids hydration mismatches and keeps the behavior predictable.
- The drawer animates with `translate-x` and `transition-transform` rather than toggling `display` so the interaction reads like a real slide-out panel.
- The desktop rail never overlays content or captures focus; the mobile drawer does, while open.

## Dark / light mode

All visual styling uses the semantic design tokens (`bg-surface`, `border-border`, `text-text-muted`, `text-primary`, `bg-primary/10`) so it automatically shifts under `[data-theme="dark"]`. The panel background is kept light and the active state remains readable without introducing raw palette overrides.

## Accessibility

- Root nav uses `nav aria-label="Main"`.
- Items are rendered as real links when `href` exists and as buttons otherwise.
- Active items use `aria-current="page"` instead of relying only on color.
- The mobile drawer traps focus while open and closes on `Escape`.
- The backdrop is `aria-hidden` and closes on click.
- Body scroll is locked while the drawer is open to prevent background page movement.

## Do / Don't

- ✅ Do keep the component routing-agnostic and accept a data list plus an active key.
- ✅ Do close the mobile drawer when a nav item is selected, but leave final navigation to the host app.
- ✅ Do use `border-l-2 border-primary` to reinforce the active item without relying only on background color.
- ❌ Don't infer the active route internally from URL knowledge or framework-specific APIs.
- ❌ Don't mix a desktop rail and a mobile drawer into one impossible state machine; let the host app control the drawer with `open`/`onOpenChange`.
- ❌ Don't treat the nav as an area for arbitrary children markup; the flat, data-driven contract is the portability win.

## Usage

```tsx
import { SideNav } from "@/components/SideNav/SideNav";

const items = [
  { key: "overview", label: "Overview", icon: <HomeIcon /> },
  { key: "team", label: "Team", icon: <UsersIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
];

<SideNav
  items={items}
  activeKey="team"
  onSelect={(key) => navigate(`/${key}`)}
  open={mobileNavOpen}
  onOpenChange={setMobileNavOpen}
/>;
```
