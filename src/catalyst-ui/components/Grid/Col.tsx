import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";

export type GridSpan = 2 | 3 | 4 | 6 | 8 | 12;
export type GridOffset = 2 | 3 | 4 | 6 | 8;

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  /** Number of columns occupied at the base breakpoint. */
  span: GridSpan;
  /** Number of columns occupied from the `sm` breakpoint. */
  sm?: GridSpan;
  /** Number of columns occupied from the `md` breakpoint. */
  md?: GridSpan;
  /** Number of columns occupied from the `lg` breakpoint. */
  lg?: GridSpan;
  /** Empty columns before this column. Intended for the first column in a row. */
  offset?: GridOffset;
}

// Keep every class literal in source: Tailwind only emits utilities it can find
// statically and cannot reliably infer classes built with string interpolation.
const spanClasses: Record<GridSpan, string> = {
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  6: "col-span-6",
  8: "col-span-8",
  12: "col-span-12",
};

const smSpanClasses: Record<GridSpan, string> = {
  2: "sm:col-span-2",
  3: "sm:col-span-3",
  4: "sm:col-span-4",
  6: "sm:col-span-6",
  8: "sm:col-span-8",
  12: "sm:col-span-12",
};

const mdSpanClasses: Record<GridSpan, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  6: "md:col-span-6",
  8: "md:col-span-8",
  12: "md:col-span-12",
};

const lgSpanClasses: Record<GridSpan, string> = {
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
};

const offsetClasses: Record<GridOffset, string> = {
  2: "col-start-3",
  3: "col-start-4",
  4: "col-start-5",
  6: "col-start-7",
  8: "col-start-9",
};

/** A span-constrained child for `Row`. */
export const Col = forwardRef<HTMLDivElement, ColProps>(
  ({ span, sm, md, lg, offset, className = "", style, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={[
        spanClasses[span],
        sm ? smSpanClasses[sm] : "",
        md ? mdSpanClasses[md] : "",
        lg ? lgSpanClasses[lg] : "",
        offset ? offsetClasses[offset] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        paddingInline: "calc(var(--grid-gutter-x, 0px) / 2)",
        paddingBlock: "calc(var(--grid-gutter-y, 0px) / 2)",
        ...style,
      } as CSSProperties}
      {...rest}
    >
      {children}
    </div>
  ),
);

Col.displayName = "Col";
