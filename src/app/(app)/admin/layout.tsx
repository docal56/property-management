import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

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

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionClaims } = await auth.protect();

  if (!readBuzzStaffRole(sessionClaims)) notFound();

  return children;
}
