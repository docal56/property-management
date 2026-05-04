import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Sidebar } from "./_sidebar";

function isBuzzStaffRole(role: unknown): role is "admin" | "super_admin" {
  return role === "admin" || role === "super_admin";
}

function readBuzzStaffRole(sessionClaims: unknown) {
  const claims = sessionClaims as {
    buzz_staff_role?: unknown;
    buzzStaffRole?: unknown;
  };

  const role = claims.buzz_staff_role ?? claims.buzzStaffRole;
  return isBuzzStaffRole(role) ? role : null;
}

export default async function ComponentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionClaims } = await auth.protect();

  if (!readBuzzStaffRole(sessionClaims)) notFound();

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-2xl py-2xl">{children}</div>
      </main>
    </div>
  );
}
