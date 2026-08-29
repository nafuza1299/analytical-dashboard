import { forwardRef, isValidElement, type HTMLAttributes, type ReactNode } from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export type TagColor = "blue" | "green" | "amber" | "red" | "purple" | "gray";
export type TagSize = "sm" | "md";

type DismissibleTagProps = {
  dismissible: true;
  onDismiss: () => void;
};

type StaticTagProps = {
  dismissible?: false;
  onDismiss?: never;
};

export type TagProps = Omit<HTMLAttributes<HTMLSpanElement>, "color"> & {
  /** Categorical color. Defaults to gray. */
  color?: TagColor;
  /** Compact or standard metadata size. Defaults to md. */
  size?: TagSize;
  /** Optional leading icon or status indicator. */
  icon?: ReactNode;
  /** Replaces tag content with a size-matched placeholder. */
  loading?: boolean;
} & (DismissibleTagProps | StaticTagProps);

const colorStyles: Record<TagColor, string> = {
  blue: "bg-tag-blue-bg text-tag-blue-text",
  green: "bg-tag-green-bg text-tag-green-text",
  amber: "bg-tag-amber-bg text-tag-amber-text",
  red: "bg-tag-red-bg text-tag-red-text",
  purple: "bg-tag-purple-bg text-tag-purple-text",
  gray: "bg-tag-gray-bg text-tag-gray-text",
};

const sizeStyles: Record<TagSize, string> = {
  sm: "h-5 px-2 text-xs",
  md: "h-6 px-2.5 text-sm",
};

const getTextContent = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return getTextContent(node.props.children);
  return "";
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ color = "gray", size = "md", icon, dismissible = false, onDismiss, loading = false, className = "", children, ...rest }, ref) => {
    const label = getTextContent(children).trim() || "tag";

    return (
      <span
        ref={ref}
        className={[
          "inline-flex shrink-0 items-center gap-1 rounded-full font-medium leading-none",
          colorStyles[color],
          sizeStyles[size],
          className,
        ].filter(Boolean).join(" ")}
        {...rest}
      >
        {loading ? <Skeleton label="Loading tag" className={size === "sm" ? "h-2.5 w-10" : "h-3 w-14"} /> : <>{icon && <span aria-hidden="true" className="inline-flex shrink-0">{icon}</span>}<span>{children}</span></>}
        {dismissible && !loading && (
          <button
            type="button"
            aria-label={`Remove ${label} tag`}
            className="-m-1 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full p-1 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
            onClick={onDismiss}
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3">
              <path d="m4 4 8 8m0-8-8 8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </span>
    );
  },
);

Tag.displayName = "Tag";
