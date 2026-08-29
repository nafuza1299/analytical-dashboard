import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Modal } from "./Modal";

const Example = ({ closeOnOverlayClick = true, closeOnEscape = true }: { closeOnOverlayClick?: boolean; closeOnEscape?: boolean }) => { const [open, setOpen] = useState(false); return <><button type="button" onClick={() => setOpen(true)}>Open modal</button><Modal open={open} onOpenChange={setOpen} closeOnOverlayClick={closeOnOverlayClick} closeOnEscape={closeOnEscape}><Modal.Header><Modal.Title>Confirm deletion</Modal.Title></Modal.Header><Modal.Body><button type="button">First action</button><button type="button">Last action</button></Modal.Body></Modal></>; };
describe("Modal", () => {
  afterEach(() => { document.body.style.overflow = ""; });
  it("renders through a portal and wires its accessible title", () => { render(<Example />); fireEvent.click(screen.getByRole("button", { name: "Open modal" })); const dialog = screen.getByRole("dialog"); expect(dialog.parentElement?.parentElement).toBe(document.body); expect(dialog).toHaveAttribute("aria-modal", "true"); expect(dialog).toHaveAttribute("aria-labelledby", screen.getByRole("heading", { name: "Confirm deletion" }).id); expect(document.body.style.overflow).toBe("hidden"); });
  it("closes with the header button, overlay, and Escape", () => { render(<Example />); const open = screen.getByRole("button", { name: "Open modal" }); open.focus(); fireEvent.click(open); fireEvent.click(screen.getByRole("button", { name: "Close" })); expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); open.focus(); fireEvent.click(open); fireEvent.click(document.querySelector('[aria-label="Close modal"]')!); expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); open.focus(); fireEvent.click(open); fireEvent.keyDown(document, { key: "Escape" }); expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); expect(open).toHaveFocus(); });
  it("honors disabled dismissal options and traps Tab focus", () => { render(<Example closeOnOverlayClick={false} closeOnEscape={false} />); fireEvent.click(screen.getByRole("button", { name: "Open modal" })); fireEvent.click(document.querySelector('[aria-label="Close modal"]')!); fireEvent.keyDown(document, { key: "Escape" }); expect(screen.getByRole("dialog")).toBeInTheDocument(); const last = screen.getByRole("button", { name: "Last action" }); last.focus(); fireEvent.keyDown(document, { key: "Tab" }); expect(screen.getByRole("button", { name: "Close" })).toHaveFocus(); });
  it("renders loading content with the requested size and forwards object refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Modal open onOpenChange={() => {}} size="lg" loading className="custom-modal" ref={ref}><p>Loaded content</p></Modal>);
    const dialog = screen.getByRole("dialog", { name: "Loading dialog" });
    expect(dialog).toHaveClass("max-w-2xl", "custom-modal");
    expect(dialog).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByText("Loaded content")).not.toBeInTheDocument();
    expect(ref.current).toBe(dialog);
  });
  it("keeps focus on an otherwise empty modal panel", () => {
    render(<Modal open onOpenChange={() => {}} size="sm" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("max-w-sm");
    fireEvent.keyDown(document, { key: "Tab" });
    expect(dialog).toHaveFocus();
  });
});
