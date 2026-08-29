import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
  type Placement,
} from "@floating-ui/react";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps {
  /** Whether the caller has the popover open. */
  open: boolean;
  /** Called for trigger toggles, outside presses, and Escape. */
  onOpenChange: (open: boolean) => void;
  /** The element that toggles the popover. */
  trigger: ReactElement;
  /** Preferred side. The panel flips when this would overflow. */
  side?: PopoverSide;
  /** Alignment along the trigger's edge. */
  align?: PopoverAlign;
  children: ReactNode;
  /** Shows a panel placeholder while its content is loading. */
  loading?: boolean;
}

/** A controlled, non-modal floating panel for rich, interactive content. */
export const Popover = ({ open, onOpenChange, trigger, side = "bottom", align = "start", loading = false, children }: PopoverProps) => {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: `${side}-${align}` as Placement,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePressEvent: "mousedown", escapeKey: true });
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  if (!isValidElement(trigger)) throw new Error("Popover trigger must be a React element.");
  const triggerProps = trigger.props as Record<string, unknown>;
  const referenceProps = getReferenceProps({
    ...triggerProps,
    ref: (node: HTMLElement | null) => refs.setReference(node),
    "aria-haspopup": "dialog",
    "aria-expanded": open,
  });

  return <>
    {cloneElement(trigger, referenceProps)}
    {open && <FloatingPortal>
      <FloatingFocusManager context={context} modal={false} initialFocus={0} returnFocus={false}>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-50 min-w-56 rounded-lg border border-border bg-surface p-4 text-text shadow-elevation outline-none"
          {...getFloatingProps()}
        >
          {loading ? <PopoverSkeleton /> : children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>}
  </>;
};

export const PopoverSkeleton = () => {
  return <div aria-busy="true" aria-label="Loading popover" className="w-48 space-y-3"><Skeleton className="w-3/5" /><Skeleton className="w-full" /><Skeleton className="w-4/5" /></div>;
};

Popover.Skeleton = PopoverSkeleton;
