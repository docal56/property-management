import {
  Children,
  cloneElement,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
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
        className="font-medium text-foreground text-sm"
        htmlFor={controlId}
      >
        {label}
        {required ? (
          <span aria-hidden className="ml-0.5 text-danger">
            *
          </span>
        ) : null}
      </label>
      {enhanced}
      {error ? (
        <p className="text-danger-foreground text-xs" id={helperId}>
          {error}
        </p>
      ) : helper ? (
        <p className="text-muted-foreground text-xs" id={helperId}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
