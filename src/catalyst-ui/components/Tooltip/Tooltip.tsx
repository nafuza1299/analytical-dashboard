import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";
import { cloneElement, isValidElement, useId, useState, type ReactElement } from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  /** Short, plain-text hint shown on hover and keyboard focus. */
  content: string;
  /** Preferred placement. The tooltip flips when this would overflow. */
  side?: TooltipSide;
  /** Delay before the tooltip opens in milliseconds. */
  delay?: number;
  /** A single interactive or focusable element. */
  children: ReactElement;
  /** Shows a short placeholder in the tooltip surface. */
  loading?: boolean;
}

/** A non-interactive hint for an existing control; use Popover for rich content. */
export const Tooltip = ({ content, side = "top", delay = 300, loading = false, children }: TooltipProps) => {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: side as Placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { move: false, delay: { open: delay, close: 0 } });
  const focus = useFocus(context);
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, role]);

  if (!isValidElement(children)) throw new Error("Tooltip expects one React element as its child.");
  const childProps = children.props as Record<string, unknown>;
  const referenceProps = getReferenceProps({
    ...childProps,
    ref: (node: HTMLElement | null) => refs.setReference(node),
  });

  return <>
    {cloneElement(children, referenceProps)}
    {open && <FloatingPortal>
      <div
        id={id}
        ref={refs.setFloating}
        style={floatingStyles}
        className="z-50 max-w-xs rounded-md bg-text px-2 py-1 text-xs font-medium text-bg shadow-elevation"
        {...getFloatingProps()}
      >
        {loading ? <TooltipSkeleton /> : content}
      </div>
    </FloatingPortal>}
  </>;
};

export const TooltipSkeleton = () => { return <Skeleton className="h-2 w-20 bg-bg/30" />; };
Tooltip.Skeleton = TooltipSkeleton;
