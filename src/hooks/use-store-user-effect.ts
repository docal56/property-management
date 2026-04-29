"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

export function useStoreUserEffect() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { isLoaded: isClerkLoaded, orgId } = useAuth();
  const [bootstrappedOrgId, setBootstrappedOrgId] = useState<
    string | null | undefined
  >(undefined);
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    // Read orgId so this effect re-fires when Clerk's active org switches.
    // The mutation reads the active org from the JWT server-side; orgId is trigger-only here.
    void orgId;
    if (!isAuthenticated) return;
    let cancelled = false;
    storeUser().then(() => {
      if (!cancelled) setBootstrappedOrgId(orgId);
    });
    return () => {
      cancelled = true;
      setBootstrappedOrgId(undefined);
    };
  }, [isAuthenticated, orgId, storeUser]);

  const isBootstrappedForActiveOrg =
    orgId !== undefined && bootstrappedOrgId === orgId;

  return {
    isLoading:
      isLoading ||
      !isClerkLoaded ||
      (isAuthenticated && (orgId === undefined || !isBootstrappedForActiveOrg)),
    isAuthenticated: isAuthenticated && isBootstrappedForActiveOrg,
  };
}
