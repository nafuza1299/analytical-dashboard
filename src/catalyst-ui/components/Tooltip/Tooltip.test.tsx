import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("opens after its delay for hover and immediately closes", () => {
    render(<Tooltip content="Copy to clipboard"><Button aria-label="Copy">Copy</Button></Tooltip>);
    const trigger = screen.getByRole("button", { name: "Copy" });
    fireEvent.mouseEnter(trigger);
    act(() => jest.advanceTimersByTime(299));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Copy to clipboard");
    expect(trigger).toHaveAttribute("aria-describedby");
    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("opens on keyboard focus", () => {
    render(<Tooltip content="Copy to clipboard"><Button aria-label="Copy">Copy</Button></Tooltip>);
    fireEvent.focus(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });

  it("renders its loading placeholder and standalone skeleton", () => {
    render(<><Tooltip content="Copy" loading><Button aria-label="Copy">Copy</Button></Tooltip><Tooltip.Skeleton /></>);
    fireEvent.focus(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByRole("tooltip").querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
