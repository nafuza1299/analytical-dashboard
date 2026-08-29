import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";

export type GridGutter = number | [horizontal: number, vertical: number];
export type RowAlign = "top" | "middle" | "bottom" | "stretch";
export type RowJustify =
  | "start"
  | "end"
  | "center"
  | "space-around"
  | "space-between"
  | "space-evenly";

export interface RowProps extends HTMLAttributes<HTMLDivElement> {
  /** Space between columns. A tuple specifies horizontal and vertical space. */
  gutter?: GridGutter;
  /** Vertical alignment for columns in each grid row. */
  align?: RowAlign;
  /** Horizontal distribution of the grid within its available space. */
  justify?: RowJustify;
  /** Keeps columns flowing into implicit grid columns when false. */
  wrap?: boolean;
}

const alignClasses: Record<RowAlign, string> = {
  top: "items-start",
  middle: "items-center",
  bottom: "items-end",
  stretch: "items-stretch",
};

const justifyClasses: Record<RowJustify, string> = {
  start: "justify-start",
  end: "justify-end",
  center: "justify-center",
  "space-around": "justify-around",
  "space-between": "justify-between",
  "space-evenly": "justify-evenly",
};

/**
 * A 12-column Tailwind-native grid container. `Col` children provide their
 * own spans; Row owns gutter spacing and grid alignment.
 */
export const Row = forwardRef<HTMLDivElement, RowProps>(
  (
    {
      gutter = 0,
      align = "top",
      justify = "start",
      wrap = true,
      className = "",
      style,
      children,
      ...rest
    },
    ref,
  ) => {
    const [horizontalGutter, verticalGutter] = Array.isArray(gutter)
      ? gutter
      : [gutter, gutter];

    return (
      <div
        ref={ref}
        className={[
          "grid grid-cols-12",
          alignClasses[align],
          justifyClasses[justify],
          !wrap ? "grid-flow-col auto-cols-[minmax(0,1fr)]" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          "--grid-gutter-x": `${horizontalGutter}px`,
          "--grid-gutter-y": `${verticalGutter}px`,
          marginInline: `-${horizontalGutter / 2}px`,
          marginBlock: `-${verticalGutter / 2}px`,
          ...style,
        } as CSSProperties}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Row.displayName = "Row";
