import React from "react";
import { render } from "@testing-library/react";
import { Col } from "./Col";
import { Row } from "./Row";

describe("Grid", () => {
  it("renders a 12-column row with numeric gutters", () => {
    const { container } = render(<Row gutter={16}>content</Row>);
    const row = container.firstElementChild;

    expect(row).toHaveClass("grid", "grid-cols-12");
    expect(row).toHaveStyle({ marginInline: "-8px", marginBlock: "-8px" });
  });

  it("supports separate horizontal and vertical gutters", () => {
    const { container } = render(<Row gutter={[12, 24]}>content</Row>);

    expect(container.firstElementChild).toHaveStyle({
      marginInline: "-6px",
      marginBlock: "-12px",
    });
  });

  it("maps spans, responsive overrides, and offsets to static Tailwind classes", () => {
    const { container } = render(
      <Col span={12} sm={8} md={6} lg={4} offset={2}>content</Col>,
    );

    expect(container.firstElementChild).toHaveClass(
      "col-span-12",
      "sm:col-span-8",
      "md:col-span-6",
      "lg:col-span-4",
      "col-start-3",
    );
  });

  it("forwards native attributes and refs", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Col ref={ref} span={6} data-testid="column">content</Col>);

    expect(ref.current).toHaveAttribute("data-testid", "column");
  });
});
