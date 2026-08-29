import {
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export interface MenuDropdownItem {
  key: string;
  label: string;
  onSelect?: () => void;
  href?: string;
}

export interface MenuBarProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  /** Controlled state for mobile sheet. */
  mobileOpen?: boolean;
  /** Called when mobile sheet open state changes. */
  onMobileOpenChange?: (open: boolean) => void;
  /** Replaces navigation slots with layout-matched placeholders. */
  loading?: boolean;
}

export interface MenuBarLinkProps extends Omit<HTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> {
  /** If provided, renders as <a>; otherwise renders as <button>. */
  href?: string;
  /** Whether this link is currently active. */
  active?: boolean;
  /** Callback when clicked; applies to both <a> and <button>. */
  onClick?: (e: React.MouseEvent) => void;
}

export interface MenuBarDropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  /** Display label for the dropdown trigger. */
  label: string;
  /** Array of menu items. */
  items: MenuDropdownItem[];
}

export interface MenuBarBrandProps extends HTMLAttributes<HTMLDivElement> {}
export interface MenuBarNavProps extends HTMLAttributes<HTMLElement> {}
export interface MenuBarActionsProps extends HTMLAttributes<HTMLDivElement> {}

const linkBaseClass =
  "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg whitespace-nowrap";
const linkInactiveClass = "text-text-muted hover:text-text hover:bg-surface-hover";
const linkActiveClass = "text-primary border-b-2 border-primary";

const dropdownTriggerClass =
  "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg whitespace-nowrap";
const dropdownTriggerInactiveClass = "text-text-muted hover:text-text hover:bg-surface-hover";
const dropdownTriggerActiveClass = "text-primary bg-primary/10";

const menuItemClass =
  "w-full text-left px-3 py-2 text-sm font-medium rounded-sm transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const menuItemInactiveClass = "text-text hover:bg-surface-hover";

const MenuBarLink = ({
  href,
  active = false,
  onClick,
  className = "",
  children,
  ...rest
}: MenuBarLinkProps) => {
  const classes = [
    linkBaseClass,
    active ? linkActiveClass : linkInactiveClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} aria-current={active ? "page" : undefined} className={classes} onClick={onClick as any} {...(rest as any)}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick as any} {...(rest as any)}>
      {children}
    </button>
  );
};

const MenuBarDropdown = ({ label, items, className = "" }: MenuBarDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % items.length);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + items.length) % items.length);
        return;
      }

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        items[highlightedIndex]?.onSelect?.();
        setIsOpen(false);
        triggerRef.current?.focus();
        return;
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, items, highlightedIndex]);

  const handleItemSelect = (item: MenuDropdownItem) => {
    item.onSelect?.();
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen(!isOpen)}
        className={[
          dropdownTriggerClass,
          isOpen ? dropdownTriggerActiveClass : dropdownTriggerInactiveClass,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
        <span aria-hidden="true" className="text-xs">
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          className="absolute top-full left-0 mt-1 min-w-48 bg-surface border border-border rounded-lg shadow-elevation z-50"
        >
          <div className="py-1">
            {items.map((item, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={item.key}
                  role="menuitem"
                  tabIndex={isHighlighted ? 0 : -1}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(0)}
                  className={[
                    menuItemClass,
                    menuItemInactiveClass,
                    isHighlighted ? "bg-primary/10" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.href ? (
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleItemSelect(item);
                      }}
                      className="block"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleItemSelect(item)}
                      className="block w-full text-left"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MenuBar = ({
  mobileOpen = false,
  onMobileOpenChange,
  loading = false,
  className = "",
  children,
  ...rest
}: MenuBarProps) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // Focus trap and escape key handling for mobile drawer
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;

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
        onMobileOpenChange?.(false);
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
  }, [mobileOpen, onMobileOpenChange]);

  return (
    <>
      <nav
        aria-label="Main"
        className={[
          "border-b border-border bg-bg",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          {loading ? <MenuBarSkeleton /> : children}
        </div>
      </nav>

      {/* Mobile drawer backdrop and panel */}
      <div
        aria-hidden={!mobileOpen}
        className={[
          "fixed inset-0 z-40 md:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          aria-label="Close navigation"
          aria-hidden={!mobileOpen}
          className={[
            "absolute inset-0 bg-black/40 transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onMobileOpenChange?.(false)}
        />

        <div
          ref={drawerRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          className={[
            "absolute inset-y-0 top-0 w-full bg-surface border-b border-border shadow-elevation transition-transform duration-200 ease-out",
            mobileOpen ? "translate-y-0" : "-translate-y-full",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex flex-col px-4 py-4 space-y-2">
            {/* Mobile drawer will contain nav items */}
            {loading ? <MenuBarSkeleton /> : children}
          </div>
        </div>
      </div>
    </>
  );
};

// Subcomponents
const MenuBarBrand = ({ className = "", children, ...rest }: MenuBarBrandProps) => {
  return (
    <div className={["flex items-center", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
};

const MenuBarNav = ({ className = "", children, ...rest }: MenuBarNavProps) => {
  return (
    <nav
      className={[
        "hidden md:flex items-center gap-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {children}
    </nav>
  );
};

const MenuBarActions = ({ className = "", children, ...rest }: MenuBarActionsProps) => {
  return (
    <div className={["flex items-center gap-2 md:gap-3", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </div>
  );
};

const MenuBarSkeleton = () => {
  return <div aria-busy="true" aria-label="Loading navigation" className="flex w-full items-center justify-between gap-4"><Skeleton className="w-24" /><div className="hidden flex-1 gap-3 md:flex"><Skeleton className="w-16" /><Skeleton className="w-16" /><Skeleton className="w-20" /></div><Skeleton className="w-20" /></div>;
};

// Attach subcomponents
MenuBar.Brand = MenuBarBrand;
MenuBar.Nav = MenuBarNav;
MenuBar.Link = MenuBarLink;
MenuBar.Dropdown = MenuBarDropdown;
MenuBar.Actions = MenuBarActions;
MenuBar.Skeleton = MenuBarSkeleton;

export { MenuBar };
