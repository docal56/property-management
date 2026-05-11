import type { ReactNode, SelectHTMLAttributes } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-medium text-12 text-foreground-muted leading-120">
      {children}
    </span>
  );
}

export function Field({
  label,
  className,
  children,
}: {
  label: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-xs", className)}>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

export function SelectInput({
  className,
  wrapperClassName,
  ...props
}: SelectInputProps) {
  return (
    <div
      className={cn(
        "group inline-flex items-center gap-md rounded-md bg-surface p-md",
        "border border-border",
        "text-14 text-foreground leading-120",
        "transition-colors",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring",
        "has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
        wrapperClassName,
      )}
    >
      <select
        className={cn(
          "min-w-0 flex-1 appearance-none bg-transparent pr-md outline-none",
          className,
        )}
        {...props}
      />
      <span className="pointer-events-none flex shrink-0 items-center text-foreground-muted">
        <Icon name="chevron-down" size="sm" />
      </span>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <span className="rounded-md bg-red-50 px-md py-sm text-13 text-red-700 leading-140">
      {message}
    </span>
  );
}
