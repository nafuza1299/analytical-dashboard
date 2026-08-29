import React from "react";
import { render, screen } from "@testing-library/react";
import { Row } from "./Row";

describe("Row Component", () => {
  it("renders a 12-column grid container with the default alignment and justification", () => {
    render(<Row data-testid="row">content</Row>);

    const row = screen.getByTestId("row");

    expect(row).toHaveClass("grid", "grid-cols-12", "items-start", "justify-start");
    expect(row).not.toHaveClass("grid-flow-col");
  });

  it("applies gutter spacing and layout modifiers for a dense column flow", () => {
    render(
      <Row gutter={[16, 24]} align="middle" justify="center" wrap={false} data-testid="row">
        content
      </Row>,
    );

    const row = screen.getByTestId("row");

    expect(row).toHaveStyle({
      marginInline: "-8px",
      marginBlock: "-12px",
    });
    expect(row).toHaveClass(
      "items-center",
      "justify-center",
      "grid-flow-col",
      "auto-cols-[minmax(0,1fr)]",
    );
  });

  it("forwards native div attributes and refs", () => {
    const ref = React.createRef<HTMLDivElement>();

    render(
      <Row ref={ref} aria-label="grid row" data-testid="row">
        content
      </Row>,
    );

    const row = screen.getByTestId("row");

    expect(ref.current).toBe(row);
    expect(row).toHaveAttribute("aria-label", "grid row");
  });
});
