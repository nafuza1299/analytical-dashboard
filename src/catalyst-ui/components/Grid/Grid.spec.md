# Grid

`Row` and `Col` provide a small, typed layout primitive on Tailwind's native 12-column grid. Use them for page and component layouts where the responsive column relationship matters.

## Props

| Component | Prop | Type | Default | Notes |
| --- | --- | --- | --- | --- |
| `Row` | `gutter` | `number \| [number, number]` | `0` | Space between columns. A tuple is `[horizontal, vertical]`; Row offsets Col's half-gutter padding with negative margins. |
| `Row` | `align` | `"top" \| "middle" \| "bottom" \| "stretch"` | `"top"` | Aligns columns within each row. |
| `Row` | `justify` | `"start" \| "end" \| "center" \| "space-around" \| "space-between" \| "space-evenly"` | `"start"` | Distributes the grid within its container. |
| `Row` | `wrap` | `boolean` | `true` | When false, columns continue into implicit grid columns. |
| `Col` | `span` | `2 \| 3 \| 4 \| 6 \| 8 \| 12` | — | Required base span. |
| `Col` | `sm` / `md` / `lg` | `2 \| 3 \| 4 \| 6 \| 8 \| 12` | — | Span override at that breakpoint. |
| `Col` | `offset` | `2 \| 3 \| 4 \| 6 \| 8` | — | Leading empty columns; use on the first column in a row. |

## Usage

```tsx
import { Col } from "@/components/Grid/Col";
import { Row } from "@/components/Grid/Row";

<Row gutter={[16, 24]}>
  <Col span={8}><Card>Main content</Card></Col>
  <Col span={4}><Card>Sidebar</Card></Col>
</Row>

<Row gutter={16}>
  <Col span={12} md={6} lg={4}>Responsive content</Col>
</Row>
```

## Extension guidance

This grid follows Tailwind's native 12-column scale. If you're used to Ant Design's 24-column system, halve those span values (AntD `span={12}` becomes `span={6}` here).

Tailwind generates utilities it can statically find in source. Keep span and breakpoint mappings as lookup objects containing fully written class names; do not replace them with dynamic strings such as `` `col-span-${span}` ``.

The grid is layout-only and introduces no color tokens. Check both a narrow mobile viewport and desktop when changing its layout behavior.
