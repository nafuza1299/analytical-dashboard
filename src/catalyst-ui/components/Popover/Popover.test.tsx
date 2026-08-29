import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Button } from "../Button/Button";
import { Popover } from "./Popover";

const Example = () => { const [open, setOpen] = useState(false); return <Popover open={open} onOpenChange={setOpen} trigger={<Button>Filters</Button>}><button type="button">Apply</button></Popover>; };

describe("Popover", () => {
  it("toggles from its trigger with dialog accessibility", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Filters" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on outside press and Escape", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("replaces panel content with a loading placeholder", () => {
    render(<Popover open onOpenChange={() => {}} trigger={<Button>Filters</Button>} loading><p>Loaded content</p></Popover>);
    expect(screen.getByLabelText("Loading popover")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();
  });
});
