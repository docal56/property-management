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
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <table
        className={cn("w-full border-collapse text-sm", className)}
        ref={ref}
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
      className={cn("border-border border-b bg-muted", className)}
      ref={ref}
      {...rest}
    />
  );
});

export const TableBody = forwardRef<
  HTMLTableSectionElement,
  HTMLAttributes<HTMLTableSectionElement>
>(function TableBody({ className, ...rest }, ref) {
  return <tbody className={className} ref={ref} {...rest} />;
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Enables the hover state (bg-muted). On by default for body rows. */
  interactive?: boolean;
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, interactive = true, ...rest }, ref) {
    return (
      <tr
        className={cn(
          "border-subtle border-b transition-colors last:border-b-0",
          interactive && "hover:bg-muted",
          className,
        )}
        ref={ref}
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
      className={cn(
        "h-10 px-4 text-left align-middle font-medium text-muted-foreground text-xs uppercase tracking-wider",
        className,
      )}
      ref={ref}
      scope="col"
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
      className={cn(
        "h-12 px-4 align-middle text-foreground text-sm",
        className,
      )}
      ref={ref}
      {...rest}
    />
  );
});
