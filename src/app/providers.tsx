"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";
import { UserBootstrap } from "@/components/user-bootstrap";
import { convex } from "@/server/convex";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider ui={ui}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <UserBootstrap>{children}</UserBootstrap>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
