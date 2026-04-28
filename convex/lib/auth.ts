import type { UserIdentity } from "convex/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type OrgTokenContext = {
  id: string;
  rol: string;
  slg: string | null;
  name: string | null;
  imageUrl: string | null;
};

export function readOrgContext(identity: UserIdentity): OrgTokenContext | null {
  const raw = identity as unknown as {
    o?: { id: string; rol: string; slg?: string | null };
    org_name?: string;
    org_image_url?: string;
  };
  if (!raw.o?.id) return null;
  return {
    id: raw.o.id,
    rol: raw.o.rol,
    slg: raw.o.slg ?? null,
    name: raw.org_name ?? null,
    imageUrl: raw.org_image_url ?? null,
  };
}

export async function findUserByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function findOrgByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("orgs")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function findMembership(
  ctx: QueryCtx,
  userId: Doc<"users">["_id"],
  orgId: Doc<"orgs">["_id"],
) {
  return await ctx.db
    .query("memberships")
    .withIndex("by_user_and_org", (q) =>
      q.eq("userId", userId).eq("orgId", orgId),
    )
    .unique();
}

export async function requireIdentity(ctx: QueryCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export async function requireUserAndOrg(ctx: QueryCtx) {
  const identity = await requireIdentity(ctx);
  const orgCtx = readOrgContext(identity);
  if (!orgCtx) throw new Error("No active organization");

  const user = await findUserByClerkId(ctx, identity.subject);
  if (!user) throw new Error("User not synced yet");

  const org = await findOrgByClerkId(ctx, orgCtx.id);
  if (!org) throw new Error("Org not synced yet");

  return { identity, orgCtx, user, org };
}

export async function ensureUserFromIdentity(
  ctx: MutationCtx,
  identity: UserIdentity,
) {
  const data = {
    clerkId: identity.subject,
    email: identity.email ?? "",
    firstName: identity.givenName ?? null,
    lastName: identity.familyName ?? null,
    imageUrl: identity.pictureUrl ?? null,
  };
  const existing = await findUserByClerkId(ctx, identity.subject);
  if (existing) {
    if (
      existing.email !== data.email ||
      existing.firstName !== data.firstName ||
      existing.lastName !== data.lastName ||
      existing.imageUrl !== data.imageUrl ||
      existing.softDeleted
    ) {
      await ctx.db.patch(existing._id, { ...data, softDeleted: false });
    }
    return existing._id;
  }
  return await ctx.db.insert("users", { ...data, softDeleted: false });
}

export async function ensureOrgFromToken(
  ctx: MutationCtx,
  orgCtx: OrgTokenContext,
) {
  const existing = await findOrgByClerkId(ctx, orgCtx.id);
  if (existing) {
    const nextName = orgCtx.name ?? existing.name;
    const nextImage = orgCtx.imageUrl ?? existing.imageUrl;
    if (
      existing.slug !== orgCtx.slg ||
      existing.name !== nextName ||
      existing.imageUrl !== nextImage ||
      existing.softDeleted
    ) {
      await ctx.db.patch(existing._id, {
        slug: orgCtx.slg,
        name: nextName,
        imageUrl: nextImage,
        softDeleted: false,
      });
    }
    return existing._id;
  }
  return await ctx.db.insert("orgs", {
    clerkId: orgCtx.id,
    name: orgCtx.name,
    slug: orgCtx.slg,
    imageUrl: orgCtx.imageUrl,
    softDeleted: false,
  });
}

export async function ensureMembership(
  ctx: MutationCtx,
  userId: Doc<"users">["_id"],
  orgId: Doc<"orgs">["_id"],
  role: string,
) {
  const existing = await findMembership(ctx, userId, orgId);
  if (existing) {
    if (existing.role !== role) await ctx.db.patch(existing._id, { role });
    return existing._id;
  }
  return await ctx.db.insert("memberships", { userId, orgId, role });
}
