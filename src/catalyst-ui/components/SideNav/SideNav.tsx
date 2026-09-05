import {
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export interface SideNavItem {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
}

export interface SideNavProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  items: SideNavItem[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Replaces nav items with placeholders while navigation data is loading. */
  loading?: boolean;
}

const itemBaseClass =
  "group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

const itemInactiveClass = "text-text-muted hover:bg-surface-hover hover:text-text";
const itemActiveClass = "border-l-2 border-primary bg-primary/10 pl-[0.625rem] text-primary";

export const SideNav = ({
  items,
  activeKey,
  onSelect,
  open = false,
  onOpenChange,
  loading = false,
  className = "",
  ...rest
}: SideNavProps) => {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open || !drawerRef.current) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableItems = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));

    const firstFocusable = focusableItems[0];
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange?.(false);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;

      const current = document.activeElement as HTMLElement | null;
      const currentFocusableItems = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));

      if (currentFocusableItems.length === 0) {
        event.preventDefault();
        return;
      }

      const first = currentFocusableItems[0];
      const last = currentFocusableItems[currentFocusableItems.length - 1];

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, onOpenChange]);

  const handleSelection = (key: string) => {
    onSelect?.(key);
    onOpenChange?.(false);
  };

  const renderItem = (item: SideNavItem) => {
    const isActive = item.key === activeKey;
    const content = (
      <>
        <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center text-base">
          {item.icon ?? <span className="h-2 w-2 rounded-full bg-current" />}
        </span>
        <span className="truncate">{item.label}</span>
      </>
    );

    const classes = [itemBaseClass, isActive ? itemActiveClass : itemInactiveClass]
      .filter(Boolean)
      .join(" ");

    if (item.href) {
      return (
        <a
          key={item.key}
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          className={classes}
          onClick={() => handleSelection(item.key)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        key={item.key}
        type="button"
        aria-current={isActive ? "page" : undefined}
        className={classes}
        onClick={() => handleSelection(item.key)}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      <nav
        aria-label="Main"
        className={[
          "hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <div className="flex h-full flex-col justify-between px-3 py-4">
          <div>
            <ul className="space-y-1" aria-label="Main navigation">
              {loading ? <SideNavSkeletonItems /> : items.map((item) => (
                <li key={item.key} className="list-none">
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div
        aria-hidden={!open}
        className={[
          "fixed inset-0 z-40 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          aria-label="Close navigation"
          aria-hidden={!open}
          className={[
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onOpenChange?.(false)}
        />

        <div
          ref={drawerRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          className={[
            "absolute inset-y-0 left-0 w-72 max-w-[85vw] transform border-r border-border bg-surface shadow-elevation transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex h-full flex-col px-3 py-4">
            <ul className="space-y-1" aria-label="Mobile navigation">
              {loading ? <SideNavSkeletonItems /> : items.map((item) => (
                <li key={item.key} className="list-none">
                  {renderItem(item)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

const SideNavSkeletonItems = () => {
  return <div aria-busy="true" aria-label="Loading navigation" className="space-y-2 px-3 py-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center gap-3"><Skeleton shape="circle" className="h-5 w-5" /><Skeleton className={index === 3 ? "w-2/5" : "w-3/5"} /></div>)}</div>;
};

SideNav.Skeleton = SideNavSkeletonItems;
