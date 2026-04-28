import { query } from "./_generated/server";
import { readBuzzStaffRole, requireBuzzAdmin } from "./lib/auth";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        isAdmin: false,
        role: null,
      };
    }
    const role = readBuzzStaffRole(identity);
    return {
      isAdmin: role !== null,
      role,
    };
  },
});

export const dashboard = query({
  args: {},
  handler: async (ctx) => {
    const { role } = await requireBuzzAdmin(ctx);

    // POC only: keep this list small and low-volume. For larger admin metrics,
    // use cached snapshots or maintained counters instead of full-table collects.
    const [users, orgs, agents, issues] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("orgs").collect(),
      ctx.db.query("agents").collect(),
      ctx.db.query("issues").collect(),
    ]);

    return {
      role,
      counts: [
        { table: "users", count: users.length },
        { table: "orgs", count: orgs.length },
        { table: "agents", count: agents.length },
        { table: "issues", count: issues.length },
      ],
    };
  },
});
