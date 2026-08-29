import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders a non-interactive span with the default gray color", () => {
    render(<Tag>Owner</Tag>);
    const tag = screen.getByText("Owner").parentElement;
    expect(tag).toHaveClass("bg-tag-gray-bg", "text-tag-gray-text", "h-6");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies the requested categorical color and size", () => {
    render(<Tag color="purple" size="sm">Feature</Tag>);
    const tag = screen.getByText("Feature").parentElement;
    expect(tag).toHaveClass("bg-tag-purple-bg", "text-tag-purple-text", "h-5");
  });

  it("renders a leading icon as decorative content", () => {
    render(<Tag icon={<svg data-testid="status-icon" />}>Active</Tag>);
    expect(screen.getByTestId("status-icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes an accessible dismiss control and calls onDismiss", async () => {
    const onDismiss = jest.fn();
    render(<Tag color="red" dismissible onDismiss={onDismiss}>Bug</Tag>);
    const button = screen.getByRole("button", { name: "Remove Bug tag" });
    expect(button).toHaveClass("min-h-6", "min-w-6");
    await userEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("replaces its label and dismiss control with a skeleton while loading", () => {
    render(<Tag dismissible onDismiss={() => {}} loading>Owner</Tag>);
    expect(screen.getByRole("status", { name: "Loading tag" })).toBeInTheDocument();
    expect(screen.queryByText("Owner")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("derives dismiss labels from nested and numeric content", () => {
    const onDismiss = jest.fn();
    render(<Tag dismissible onDismiss={onDismiss}><strong>Release </strong>{42}</Tag>);
    expect(screen.getByRole("button", { name: "Remove Release 42 tag" })).toBeInTheDocument();
  });
});
