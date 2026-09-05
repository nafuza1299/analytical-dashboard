import {
  forwardRef,
  useState,
  useEffect,
  type HTMLAttributes,
  type ReactNode,
} from "react";

// Main Layout component
export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Switches flex direction: false (column/vertical) for outer shell, true (row/horizontal) for Sider+Content */
  hasSider?: boolean;
  children?: ReactNode;
}

const LayoutRoot = forwardRef<HTMLDivElement, LayoutProps>(
  ({ hasSider = false, className = "", children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          "flex",
          hasSider ? "flex-row" : "flex-col",
          hasSider ? "flex-1" : "min-h-screen",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
LayoutRoot.displayName = "Layout";

// Header sub-component
export interface LayoutHeaderProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const LayoutHeader = forwardRef<HTMLElement, LayoutHeaderProps>(
  ({ className = "", children, ...rest }, ref) => {
    return (
      <header
        ref={ref}
        className={[
          "flex-shrink-0",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </header>
    );
  }
);
LayoutHeader.displayName = "LayoutHeader";

// Sider sub-component
export interface LayoutSiderProps extends HTMLAttributes<HTMLDivElement> {
  /** Fixed width in pixels on desktop (default: 240) */
  width?: number;
  /** Enable collapse-to-icon-rail behavior */
  collapsible?: boolean;
  /** Controlled state: whether the sider is collapsed */
  collapsed?: boolean;
  /** Callback when collapsed state changes */
  onCollapse?: (collapsed: boolean) => void;
  /** Breakpoint below which Sider auto-collapses/hides (default: "lg") */
  breakpoint?: "sm" | "md" | "lg";
  children?: ReactNode;
}

const LayoutSider = forwardRef<HTMLDivElement, LayoutSiderProps>(
  (
    {
      width = 240,
      collapsible = false,
      collapsed = false,
      onCollapse,
      breakpoint = "lg",
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);

    // Sync mobile state with breakpoint and call onCollapse when it changes
    useEffect(() => {
      const breakpointPixels: Record<"sm" | "md" | "lg", number> = {
        sm: 640,
        md: 768,
        lg: 1024,
      };
      const breakpointValue = breakpointPixels[breakpoint];

      const handleResize = () => {
        const shouldBeMobile = window.innerWidth < breakpointValue;
        if (shouldBeMobile !== isMobile) {
          setIsMobile(shouldBeMobile);
          // Notify parent when breakpoint is crossed
          if (onCollapse && collapsible) {
            onCollapse(shouldBeMobile);
          }
        }
      };

      window.addEventListener("resize", handleResize);
      handleResize(); // Check on mount

      return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint, collapsible, isMobile, onCollapse]);

    // Determine display width based on responsive state and controlled collapsed prop
    const shouldHide = isMobile || (collapsible && collapsed);
    const displayWidth = shouldHide ? 0 : width;

    return (
      <aside
        ref={ref}
        className={[
          "flex-shrink-0 overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
          "bg-surface border-r border-border",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          width: displayWidth,
          ...(rest.style as Record<string, any>),
        }}
        {...rest}
      >
        {children}
      </aside>
    );
  }
);
LayoutSider.displayName = "LayoutSider";

// Content sub-component
export interface LayoutContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

const LayoutContent = forwardRef<HTMLDivElement, LayoutContentProps>(
  ({ className = "", children, ...rest }, ref) => {
    return (
      <main
        ref={ref}
        className={[
          "flex-1 min-w-0 overflow-y-auto",
          "flex flex-col",
          "px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
          "bg-bg",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </main>
    );
  }
);
LayoutContent.displayName = "LayoutContent";

// Footer sub-component
export interface LayoutFooterProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

const LayoutFooter = forwardRef<HTMLElement, LayoutFooterProps>(
  ({ className = "", children, ...rest }, ref) => {
    return (
      <footer
        ref={ref}
        className={[
          "flex-shrink-0 flex items-center justify-center",
          "h-16 px-4 sm:px-6 lg:px-8",
          "bg-surface border-t border-border",
          "text-sm text-secondary",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {children}
      </footer>
    );
  }
);
LayoutFooter.displayName = "LayoutFooter";

// Compound export
export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Sider: LayoutSider,
  Content: LayoutContent,
  Footer: LayoutFooter,
});
