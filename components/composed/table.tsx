import {
  forwardRef,
  type HTMLAttributes,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export const Table = forwardRef<
  HTMLTableElement,
  HTMLAttributes<HTMLTableElement>
>(function Table({ className, ...rest }, ref) {
  return (
    <div className="rounded-md overflow-hidden bg-background border border-border">
      <table
        ref={ref}
        className={cn("w-full border-collapse text-sm", className)}
        {...rest}
      />
    </div>
  );
});

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableHeader({ className, ...rest }, ref) {
  return (
    <thead
      ref={ref}
      className={cn("bg-muted border-b border-border", className)}
      {...rest}
    />
  );
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...rest }, ref) {
  return <tbody ref={ref} className={className} {...rest} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Enables the hover state (bg-muted). On by default for body rows. */
  interactive?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, interactive = true, ...rest }, ref) {
    return (
      <tr
        ref={ref}
        className={cn(
          "border-b border-subtle last:border-b-0 transition-colors",
          interactive && "hover:bg-muted",
          className,
        )}
        {...rest}
      />
    );
  },
);

export const TableHead = forwardRef<
  HTMLTableCellElement,
  ThHTMLAttributes<HTMLTableCellElement>
>(function TableHead({ className, ...rest }, ref) {
  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        "h-10 px-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground align-middle",
        className,
      )}
      {...rest}
    />
  );
});

export const TableCell = forwardRef<
  HTMLTableCellElement,
  TdHTMLAttributes<HTMLTableCellElement>
>(function TableCell({ className, ...rest }, ref) {
  return (
    <td
      ref={ref}
      className={cn("h-12 px-4 text-sm text-foreground align-middle", className)}
      {...rest}
    />
  );
});
