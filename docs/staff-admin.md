# Staff Admin Setup

Buzz staff admin access is separate from customer organization access. Customer
admin permissions continue to use Clerk organization roles through the active org
claim. Staff admin permissions use a global Clerk user metadata flag that is
copied into the token Convex receives as a signed custom claim.

## Current Surface

- Route: `/admin/dashboard`
- Sidebar entry: `Admin`, shown above the organization selector when the signed-in user has staff access
- Backend module: `convex/admin.ts`
- Auth helper: `requireBuzzAdmin()` in `convex/lib/auth.ts`

The first dashboard is intentionally small: it shows table counts as a structural
proof of concept. Future admin functions should stay under the `convex/admin*`
area and call `requireBuzzAdmin()` before reading or mutating cross-tenant data.

## Clerk Metadata

Set the staff role on the Clerk user's public metadata:

```json
{
  "buzzStaffRole": "admin"
}
```

Accepted values in the app:

- `admin`
- `super_admin`

Use public metadata here because Clerk's session token customization supports
public metadata fields, and public metadata can only be written from the backend.
The value is visible to the frontend, so do not put secrets or sensitive internal
notes in it.

Private metadata would be preferable for secrecy, but Clerk's session token
customization UI does not expose `user.private_metadata` for this setup. If the
claim preview shows a literal template string such as
`"{{user.private_metadata.buzzStaffRole}}"`, the token will not work.

Do not use unsafe metadata for staff access. Unsafe metadata can be changed from
the frontend and must never be used for authorization.

## Clerk Token Claim

In the Clerk dashboard, add this custom claim to the token Convex receives:

```json
{
  "buzz_staff_role": "{{user.public_metadata.buzzStaffRole}}"
}
```

`buzz_staff_role` is a custom claim. It is not a standard OIDC profile claim,
but custom claims are valid in JWTs. Keep the standard Convex audience claim
intact:

```json
{
  "aud": "convex"
}
```

For this app's current Clerk + Convex setup, start with Clerk's session token
customization:

1. Go to Clerk Dashboard -> Sessions.
2. Under "Customize session token", merge the `buzz_staff_role` claim into the
   existing JSON.
3. Save the claim.
4. Use the Clerk preview for a staff user and confirm it resolves to
   `"buzz_staff_role": "admin"` or `"buzz_staff_role": "super_admin"`. It must
   not show the literal template string.

This matters because `ConvexProviderWithClerk` can use Clerk's Convex
integration token directly when the current session token already has
`aud: "convex"`. In that mode, a separate JWT template named `convex` is not
the token Convex receives.

If a Clerk environment is configured to use a named JWT template instead, add the
same claim to the `convex` JWT template. Do not replace the existing claims;
merge this field into the existing JSON.

The claim is intentionally tiny. Convex reads the signed token on each admin
function call via `ctx.auth.getUserIdentity()`, so the browser cannot forge admin
access even though the final claim may be visible in the token.

The code accepts both `buzz_staff_role` and `buzzStaffRole` from the token for
compatibility, but the configured Clerk claim should be `buzz_staff_role`.

Metadata changes do not appear in an existing session token immediately. After
granting or removing staff access, force a session refresh or have the user sign
out and sign back in before testing the admin route.

## Authorization Rules

- Sidebar visibility uses `api.admin.viewer`.
- Admin dashboard data uses `api.admin.dashboard`.
- Direct route access to `/admin/dashboard` is allowed by the Next route layer
  for any signed-in user, but non-staff users do not receive admin data.
- Convex is the enforcement boundary. Every staff-only query or mutation must
  call `requireBuzzAdmin()` or a stricter helper built on top of it.
- Do not authorize staff access from the synced `users`, `memberships`, or
  customer organization role rows.

## Environment Checklist

Configure this separately in production Clerk and development Clerk:

1. Add or confirm `publicMetadata.buzzStaffRole` on the staff user's Clerk profile.
2. Add or confirm the `buzz_staff_role` claim in Clerk's session token customization.
3. If the environment uses a named Convex JWT template instead, add the same claim there too.
4. Confirm the token preview resolves to `admin` or `super_admin`, not a literal template string.
5. Refresh the user's session.
6. Visit `/admin/dashboard`.
7. Confirm the Admin sidebar link appears.
8. Confirm table counts load.
9. Confirm a non-staff test user can sign in but does not see the Admin link.

Keep production and development Clerk instances separate. Granting staff access
in development must not grant staff access in production.
