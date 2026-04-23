import { forwardRef, type ReactNode } from "react";
import { IconSearch } from "@/components/ui/icons";
import { Input, type InputProps } from "@/components/ui/input";

export interface SearchInputProps
  extends Omit<InputProps, "leadingIcon" | "type"> {
  /** Optional render slot shown on the right (e.g. clear button). */
  trailingSlot?: ReactNode;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { placeholder = "Search", trailingSlot, trailingIcon, ...rest },
    ref,
  ) {
    return (
      <Input
        leadingIcon={<IconSearch />}
        placeholder={placeholder}
        ref={ref}
        trailingIcon={trailingSlot ?? trailingIcon}
        type="search"
        {...rest}
      />
    );
  },
);
