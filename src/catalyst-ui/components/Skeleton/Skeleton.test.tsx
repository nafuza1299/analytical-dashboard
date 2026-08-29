import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a decorative text placeholder by default", () => {
    const { container } = render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveClass("animate-pulse", "bg-surface-hover", "h-4", "rounded-sm");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(container).toBeInTheDocument();
  });

  it("supports labelled shape variants", () => {
    render(<Skeleton shape="circle" label="Loading avatar" className="w-10" />);
    expect(screen.getByRole("status", { name: "Loading avatar" })).toHaveClass("rounded-full", "w-10");
  });
});
