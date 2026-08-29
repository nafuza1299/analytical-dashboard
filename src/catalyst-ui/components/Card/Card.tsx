import {
  Children,
  forwardRef,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export type CardPadding = "none" | "sm" | "md";
export type CardAs = "div" | "article";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Controls default spacing when the card is used without structured sub-sections. */
  padding?: CardPadding;
  /** Adds hover/focus affordance for interactive cards. */
  interactive?: boolean;
  /** Semantic wrapper element. Defaults to div. */
  as?: CardAs;
  /** Replaces content with a built-in card placeholder. */
  loading?: boolean;
}

export interface CardSectionProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
};

const interactiveStyles =
  "cursor-pointer transition-colors duration-150 hover:border-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

const hasStructuredCardContent = (children: ReactNode): boolean => {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) return false;

    const type = child.type as { displayName?: string };
    return [
      "CardHeader",
      "CardTitle",
      "CardDescription",
      "CardBody",
      "CardFooter",
    ].includes(type.displayName ?? "");
  });
};

const CardRoot = forwardRef<HTMLElement, CardProps>(
  (
    {
      as = "div",
      padding = "md",
      interactive = false,
      loading = false,
      className = "",
      children,
      ...rest
    },
    ref,
  ) => {
    const Component = as === "article" ? "article" : "div";
    const hasSections = hasStructuredCardContent(children);

    return (
      <Component
        ref={ref as any}
        className={[
          "rounded-lg border border-border bg-surface shadow-elevation overflow-hidden",
          !hasSections ? paddingStyles[padding] : "",
          interactive ? interactiveStyles : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading ? <CardSkeleton /> : children}
      </Component>
    );
  },
);

CardRoot.displayName = "Card";

const CardHeader = forwardRef<HTMLElement, CardSectionProps>(
  ({ className = "", children, ...rest }, ref) => (
    <header
      ref={ref as any}
      className={["border-b border-border px-4 py-4 sm:px-6 sm:py-5", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </header>
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLElement, CardSectionProps>(
  ({ className = "", children, ...rest }, ref) => (
    <h3
      ref={ref as any}
      className={["text-base font-semibold text-text", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </h3>
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLElement, CardSectionProps>(
  ({ className = "", children, ...rest }, ref) => (
    <p
      ref={ref as any}
      className={["mt-1 text-sm text-text-muted", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </p>
  ),
);
CardDescription.displayName = "CardDescription";

const CardBody = forwardRef<HTMLElement, CardSectionProps>(
  ({ className = "", children, ...rest }, ref) => (
    <div
      ref={ref as any}
      className={["px-4 py-4 sm:px-6 sm:py-6", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </div>
  ),
);
CardBody.displayName = "CardBody";

const CardFooter = forwardRef<HTMLElement, CardSectionProps>(
  ({ className = "", children, ...rest }, ref) => (
    <footer
      ref={ref as any}
      className={[
        "flex flex-col gap-2 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </footer>
  ),
);
CardFooter.displayName = "CardFooter";

const CardSkeleton = () => {
  return <div aria-busy="true" aria-label="Loading card" className="space-y-4 p-4 sm:p-6"><Skeleton className="w-2/5" /><Skeleton className="w-full" /><Skeleton className="w-4/5" /><Skeleton shape="rect" className="h-20 w-full" /></div>;
};

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
  Skeleton: CardSkeleton,
});
