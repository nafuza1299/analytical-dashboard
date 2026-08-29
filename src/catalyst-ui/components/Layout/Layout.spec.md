# Layout

App-shell scaffolding — the outermost structural wrapper that arranges Header, Sider (side nav container), Content, and Footer into a coherent page frame. **Layout does not reimplement responsive behavior** — it delegates drawer/collapse logic to `SideNav` and `MenuBar` components, which handle their own mobile adaptations at matching breakpoints.

## Pattern: Compound, nestable

Layout uses a nested compound pattern for flexibility — the outer `Layout` stacks Header/body/Footer vertically; an inner `Layout` with `hasSider={true}` arranges Sider + Content horizontally. This nesting makes arbitrary combinations possible (header-only, sider-only, both, sider-on-right) without prop explosion.

```jsx
<Layout>
  {/* Outer vertical stack */}
  <Layout.Header>
    <MenuBar>{/* navigation content */}</MenuBar>
  </Layout.Header>

  {/* Inner horizontal row */}
  <Layout hasSider>
    <Layout.Sider width={240}>
      <SideNav items={[...]} activeKey="..." />
    </Layout.Sider>

    <Layout.Content>
      {/* page content: Card, Table, etc. */}
    </Layout.Content>
  </Layout>

  <Layout.Footer>
    © 2026 Your Company
  </Layout.Footer>
</Layout>
```

## Props

| Component | Prop | Type | Default | Notes |
|-----------|------|------|---------|-------|
| `Layout` | `hasSider` | `boolean` | `false` | Switches flex direction: `false` = vertical stack (outer shell), `true` = horizontal row (Sider + Content) |
| `Layout.Header` | — | — | — | Simple wrapper (flex-shrink-0) that doesn't impose height/padding constraints. Child components (e.g., MenuBar) handle their own layout and styling. |
| `Layout.Sider` | `width` | `number` | `240` | Fixed width in pixels. Ignored when collapsed. |
| `Layout.Sider` | `collapsible` | `boolean` | `false` | Enables controlled collapse state via `collapsed` / `onCollapse`. |
| `Layout.Sider` | `collapsed` | `boolean` | `false` | Controlled state. When `true`, Sider width becomes `0` (hidden). |
| `Layout.Sider` | `onCollapse` | `(collapsed: boolean) => void` | — | Called when responsive breakpoint is crossed. Typically used to sync with a parent toggle. |
| `Layout.Sider` | `breakpoint` | `"sm" \| "md" \| "lg"` | `"lg"` | Below this width, Sider auto-hides. Must match the `SideNav` breakpoint for consistent UX. |
| `Layout.Content` | — | — | — | Flexes to fill remaining space; scrollable if content overflows. |
| `Layout.Footer` | — | — | — | Auto-height; sits at bottom of vertical stack. |

## Architectural notes: Delegation, not duplication

Layout is a **structural primitive** — it manages flex layout and spacing. It does **not** reimplement responsive drawer or collapse behavior:

- **`Layout.Sider` below `breakpoint`**: Sider width collapses to `0` and hides. The `SideNav` component inside it should use the **same breakpoint** and switch to its own drawer mode (already implemented in `SideNav`). This keeps drawer mechanics in one place — `SideNav`.

- **`Layout.Header` on mobile**: Header height stays fixed. The `MenuBar` inside it handles its own mobile sheet/hamburger behavior (already implemented in `MenuBar`). Layout doesn't intercept or duplicate that.

**Important**: Pass the same `breakpoint` to `Layout.Sider` and the `SideNav` it wraps. Otherwise, Sider and SideNav will hide/show at different widths, breaking the layout.

```jsx
// ✅ DO: Match breakpoints
<Layout.Sider breakpoint="lg">
  <SideNav breakpoint="lg" {...props} />
</Layout.Sider>

// ❌ DON'T: Mismatched breakpoints will cause layout inconsistency
<Layout.Sider breakpoint="md">
  <SideNav breakpoint="lg" {...props} />
</Layout.Sider>
```

## Responsive behavior

| Breakpoint | Behavior |
|---|---|
| Desktop (`>= lg`) | Sider fixed at `width` px; Header and Content at full width. |
| Tablet/Mobile (`< lg` by default) | Sider collapses to `0` width (hidden). `SideNav` inside switches to drawer mode. Header height unchanged; `MenuBar` handles own mobile sheet. |

The `breakpoint` prop on `Layout.Sider` defines the threshold. Common values align with Tailwind's breakpoints:
- `"sm"`: 640px
- `"md"`: 768px
- `"lg"`: 1024px (default)

## Design tokens

Reuses existing tokens:
- `bg-bg`: Content area background
- `bg-surface`: Header, Sider, Footer background (one step up in elevation, matching Card)
- `border-border`: Dividing lines (Header/Content, Sider/Content)

## Example: Full-page layout with header, sidebar, and footer

```jsx
import { Layout } from "./components/Layout/Layout";
import { MenuBar } from "./components/MenuBar/MenuBar";
import { SideNav } from "./components/SideNav/SideNav";
import { Card } from "./components/Card/Card";

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Layout>
      <Layout.Header>
        <MenuBar
          items={[
            { key: "home", label: "Home" },
            { key: "about", label: "About" },
          ]}
          onSelect={(key) => console.log("Selected:", key)}
        />
      </Layout.Header>

      <Layout hasSider>
        <Layout.Sider
          width={240}
          collapsible
          collapsed={!sidebarOpen}
          onCollapse={setSidebarOpen}
          breakpoint="lg"
        >
          <SideNav
            items={[
              { key: "dashboard", label: "Dashboard", icon: "📊" },
              { key: "settings", label: "Settings", icon: "⚙️" },
            ]}
            activeKey="dashboard"
            breakpoint="lg"
          />
        </Layout.Sider>

        <Layout.Content>
          <Card>
            <Card.Header>
              <Card.Title>Welcome</Card.Title>
            </Card.Header>
            <Card.Body>
              <p>This is your main content area.</p>
            </Card.Body>
          </Card>
        </Layout.Content>
      </Layout>

      <Layout.Footer>© 2026 Your Company. All rights reserved.</Layout.Footer>
    </Layout>
  );
}
```

## Do's and Don'ts

| Do | Don't |
|---|---|
| Use `Layout` as the root wrapper for full-page shells. | Don't add collapse/drawer logic to `Layout` — that's `SideNav`'s job. |
| Nest `Layout hasSider` inside the outer `Layout` for sidebar + content arrangements. | Don't pass different `breakpoint` values to `Layout.Sider` and the `SideNav` inside it. |
| Keep Header and Footer simple — they're for chrome only. | Don't put page-level routing or page content in Header/Footer. |
| Sync `breakpoint` on `Layout.Sider` and `SideNav` explicitly in your code. | Don't rely on "default breakpoints will match" — be explicit. |
