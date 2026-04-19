import { forwardRef, type ReactNode } from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { IconSearch } from "@/components/ui/icons";

export interface SearchInputProps extends Omit<InputProps, "leadingIcon" | "type"> {
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
        ref={ref}
        type="search"
        placeholder={placeholder}
        leadingIcon={<IconSearch />}
        trailingIcon={trailingSlot ?? trailingIcon}
        {...rest}
      />
    );
  },
);
