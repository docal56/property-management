"use client";

import type { ReactNode } from "react";
import { useStoreUserEffect } from "@/hooks/use-store-user-effect";

export function UserBootstrap({ children }: { children: ReactNode }) {
  const { isLoading } = useStoreUserEffect();

  if (isLoading) return null;

  return children;
}
