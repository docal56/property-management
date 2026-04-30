"use client";

import type { ChangeEvent, ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { PageTitle } from "@/components/ui/page-title";
import { TextInput } from "@/components/ui/text-input";
import { cn } from "@/lib/utils";

type PageHeaderListProps = {
  title: ReactNode;
  titleIcon: ReactNode;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
};

export function PageHeaderList({
  title,
  titleIcon,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search",
  className,
}: PageHeaderListProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <div
      className={cn(
        "flex h-[58px] items-center justify-between py-xs pr-md",
        className,
      )}
    >
      <PageTitle icon={titleIcon}>{title}</PageTitle>
      <TextInput
        leadingIcon={<Icon name="search" size="md" />}
        onChange={handleChange}
        placeholder={searchPlaceholder}
        value={searchValue}
        wrapperClassName="w-[360px]"
      />
    </div>
  );
}
