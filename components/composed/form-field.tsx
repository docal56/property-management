import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  /** Helper text shown under the control. Hidden if `error` is set. */
  helper?: ReactNode;
  /** Error text shown under the control. Replaces helper. */
  error?: ReactNode;
  /** Mark the label visually as required. */
  required?: boolean;
  /** The single form control element (e.g. <Input />). */
  children: ReactNode;
}

export function FormField({
  label,
  helper,
  error,
  required,
  className,
  children,
  ...rest
}: FormFieldProps) {
  const generatedId = useId();
  const child = Children.only(children) as ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    invalid?: boolean;
  }>;
  const controlId = child.props?.id ?? generatedId;
  const helperId = `${controlId}-helper`;

  const enhanced = isValidElement(child)
    ? cloneElement(child, {
        id: controlId,
        "aria-describedby": helper || error ? helperId : undefined,
        invalid: error ? true : child.props?.invalid,
      })
    : child;

  return (
    <div className={cn("flex flex-col gap-2", className)} {...rest}>
      <label
        htmlFor={controlId}
        className="text-sm font-medium text-foreground"
      >
        {label}
        {required ? (
          <span aria-hidden className="text-danger ml-0.5">
            *
          </span>
        ) : null}
      </label>
      {enhanced}
      {error ? (
        <p id={helperId} className="text-xs text-danger-foreground">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-xs text-muted-foreground">
          {helper}
        </p>
      ) : null}
    </div>
  );
}
