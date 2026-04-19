# Product Spec — Phase 0

The current build scope. This document is self-contained: everything a coding agent needs to build Phase 0 is here.

For the broader product vision beyond Phase 0, see `vision-spec.md` — it is reference only and not required for implementation.

---

## 1. Concept

A SaaS product for UK estate agents. An AI Phone Agent answers inbound calls from tenants reporting property issues, captures structured details, and creates an Issue record. An Admin at the Agency uses a web app to triage, work, and resolve those Issues.

Phase 0 validates the core loop: **call → Issue → Admin works it → resolved.**

---

## 2. Terminology

| Term | Meaning |
|---|---|
| Agency / Estate Agent | The customer business (our tenant). Multi-tenant architecture — each Agency's data is isolated. |
| Admin | A user at the Agency with full access to the app. Only role in Phase 0. |
| AI Agent / Phone Agent | An ElevenLabs voice bot that answers calls on behalf of the Agency. |
| Managed Property | A property the Agency manages. Issues are attached to Properties. |
| Contact | A person — in Phase 0 this is always a tenant. |
| Issue | A property-related problem reported by a tenant. The central record. |
| Call | An inbound call handled by the AI Agent. May or may not produce an Issue. |

---

## 3. Users and Access

**Admin (only role in Phase 0)**
- Signs in via Clerk
- Belongs to one Agency
- Full access to everything the app shows: Open Issues, Call Logs, all Issue details

No Team Member role, no assignment to Users, no team management UI. Everyone with app access has the same capabilities.

Multi-Agency data isolation is enforced — an Admin only sees data for their own Agency.

---

## 4. Data Model

### Agency
- Name
- Phone number (Twilio, assigned to the Property Management AI Agent)
- Created/updated timestamps

### Managed Property
- Belongs to an Agency
- Address (full UK address with postcode)
- Current tenant (Contact reference; required in Phase 0)
- Created/updated timestamps

### Contact
- Belongs to an Agency
- Name
- Phone number
- Email (optional)
- Created/updated timestamps

Contacts in Phase 0 are always tenants. The Contact-as-tenant link is expressed via the `currentTenant` reference on Managed Property.

### Issue
- Belongs to an Agency
- Linked to one Managed Property (required)
- Linked to one Contact — the tenant who reported it (required)
- Structured Details block captured by the AI Agent:
  - Address (string — as spoken by the tenant, should match the Managed Property)
  - Tenant name (string)
  - Tenant contact number (string)
  - Issue description (string — free-form, written by the AI Agent)
- Urgent flag (boolean — set by AI Agent based on rules in its prompt; see section 6)
- Status (enum: `new`, `in_progress`, `contractor_scheduled`, `awaiting_follow_up`, `resolved`)
- Contractor for the job (string, free-text, nullable)
- Media attachments (list of file references, see Media below)
- Call reference — the Call record this Issue was created from
- Created/updated timestamps
- Resolved timestamp (set when status moves to `resolved`; used for media retention)

### Call
- Belongs to an Agency
- Phone Agent identifier (string — in Phase 0 always "Property Management")
- Duration (seconds)
- Call Status (enum: `success`, `failed`) — see section 7
- Audio recording reference (URL, typically ElevenLabs-hosted)
- Transcript (structured list of conversation turns, each with speaker and text)
- Linked Issue (nullable — only set when the call produced a successful Issue)
- Created timestamp

### Media
- Belongs to an Issue
- Type (`photo` or `video`)
- File reference (Convex storage ID)
- Uploaded by (User reference)
- Uploaded at (timestamp)
- Scheduled-for-deletion timestamp (nullable)

Audio recordings and transcripts are NOT stored as Media entities — they live on the Call record.

---

## 5. AI Phone Agent

The Property Management AI Agent, built in ElevenLabs, is the only Phone Agent in Phase 0.

### Inbound flow

1. Tenant calls the Agency's dedicated Twilio number.
2. AI Agent greets, confirms the caller's name.
3. AI Agent asks for the property address and matches it against the Agency's Managed Properties (using tenant name + address).
4. AI Agent asks what the issue is, probes for detail.
5. AI Agent asks the tenant to send any photo/video to the Agency directly (via the Agency's own phone/email — outside this app), with the property address included.
6. AI Agent confirms details back to the tenant.
7. Call ends. AI Agent writes the structured Details block.

### Required output from the AI Agent

For a call to count as Success, the AI Agent must capture all four of:
- Property address
- Tenant name
- Tenant contact number
- Issue description

If any of these four is missing, the call is Failed (see section 7).

### Urgent flag

The AI Agent sets the `urgent` boolean on the Issue based on rules in its prompt (e.g. no heating, flooding, security issue). It does NOT ask the tenant "is this urgent?" — callers self-report as urgent, so the flag is inferred from the issue content.

### Webhook / integration shape

On call completion, ElevenLabs sends the call data to an endpoint on the app. The endpoint:
1. Creates a Call record with audio, transcript, duration, and Call Status
2. If Call Status = Success, creates an Issue linked to the matched Managed Property and Contact, populates the Details block, sets the Urgent flag, links the Call to the Issue
3. If Call Status = Failed, the Call record stands alone without an Issue

---

## 6. Channels

Inbound channels the system accepts automatically:
- **Voice call** (Twilio → ElevenLabs) — the only automated channel in Phase 0
- **SMS** — the AI Agent can handle text exchanges the same way as voice (same transcript model, no audio). Treated as a Call internally.

**Media handling in Phase 0 is manual.** The AI Agent tells tenants to send photos/videos to the Agency directly. Admins upload those photos/videos to the Issue through the app. No automated email or WhatsApp ingestion.

---

## 7. Call Status and Pass Rate

**Call Status** is per-Call:
- `success` — AI Agent captured all four required fields (address, tenant name, tenant contact number, issue description)
- `failed` — one or more of the four was not captured

**Pass Rate** is a metric shown on Call Logs:
- Pass Rate = (Success calls ÷ Total calls) × 100
- Calculated over the user-selected date range

---

## 8. Pages

Two pages total in Phase 0:

### 8.1 Open Issues

The primary workspace. Shows all open Issues grouped by status.

Content and behaviour are specified in `design-spec.md` section 1 (Open Issues) and section 2 (Issue slide-over panel). This spec defines the data and logic; the design spec defines the UI and interactions.

**Behaviours the page requires:**
- List all Issues belonging to the current Admin's Agency where status ≠ `resolved`, grouped by status
- Collapsed "Closed" section at the bottom showing Issues where status = `resolved`
- Click-through to the slide-over panel
- Keyboard up/down navigation between Issues while the panel is open
- Text search across property address and issue description

### 8.2 Call Logs

Reporting view. Metrics + call list for a selected date range.

Content and behaviour are specified in `design-spec.md` section 3.

**Behaviours the page requires:**
- Four metric cards: Calls, Issues Recorded, Open Issues, Pass Rate
- All metrics except "Open Issues" respect the selected date range; "Open Issues" is a live count regardless of range
- Logs table of every Call in the date range with Date, Agent, Duration, Call Status
- Default date range: This week

### 8.3 Issue slide-over panel

Opens from Open Issues. Lets the Admin view and update a single Issue.

Content and behaviour are specified in `design-spec.md` section 2.

**Behaviours the panel requires:**
- Edit Status (dropdown)
- Edit Contractor for the job (free-text)
- Display the Details block (AI-captured structured text)
- Manual upload of photos/videos (appended to Issue media)
- Play the call recording
- Read the full transcript
- Copy Details button — copies the Details block text to the clipboard
- Up/Down browse to previous/next Issue in the current list
- URL updates so Issues are linkable

### 8.4 Auth

Clerk sign-in for Admins. No self-service signup in Phase 0 — Admins are invited via Clerk by the operator during onboarding.

---

## 9. Media Retention

- Photos and videos attached to an Issue are soft-deleted 90 days after the Issue moves to `resolved`.
- Soft-delete: a scheduled job marks media as scheduled-for-deletion.
- After a further 7 days with the scheduled-for-deletion timestamp in the past, a second job permanently deletes the file from Convex storage.
- Audio recordings follow the same retention policy.
- Transcripts are text and kept indefinitely.

---

## 10. Onboarding

Phase 0 onboarding is **operator-run, not a user-facing flow.** No UI for Agency creation, property import, or tenant import.

**Per new Agency, the operator:**
1. Creates the Agency record directly in the database
2. Assigns a Twilio number from the pool
3. Wires the number to the Property Management AI Agent in ElevenLabs
4. Creates Managed Property records and Contact records (current tenants), linking each Property to its current tenant
5. Creates the Admin User in Clerk and sends them an invite
6. Admin signs in and starts using the app

No CSV upload UI, no admin-facing onboarding flow, no data import tool in Phase 0.

---

## 11. Explicitly Not in Phase 0

To prevent scope drift, these are deliberately out of scope:

- Team Member role or any role other than Admin
- Per-User Issue assignment (there is only "Contractor for the job", a free-text field)
- Notes on Issues
- Filters on Open Issues (search only)
- Managed Properties list or detail page
- Contacts list or detail page
- Settings pages (Agency, Team, User) — no settings UI at all
- Email / SMS / push / in-app notifications
- Empty, loading, and error state designs (implemented pragmatically, not designed)
- Audit trail UI
- Separate "Closed (No Action)" status — the single Resolved status covers both fixed-and-done and no-action-needed
- Automated media ingestion (email, WhatsApp, etc.)
- Lead capture, Out of Hours AI Agent, Enquiry entity
- Billing
- Self-service Agency signup
- Reports / dashboards beyond the four metrics on Call Logs
- Mobile-native app
- Clickable rows on Call Logs (no navigation from a Call back to its Issue)
- "Failed" tooltip explaining which field was missing

If a feature isn't listed in this document (sections 3–10), it's not in Phase 0.

---

## 12. Success Criteria

Phase 0 is complete when:
- The first Agency's AI Agent is answering tenant calls in production
- Calls successfully create Issue records with all four required fields
- The Admin can sign in, see Open Issues grouped by status, open the slide-over panel, update status and contractor, upload media, copy Details, and move Issues to Resolved
- The Admin can view Call Logs for a chosen date range with all four metrics working
- Call recordings and transcripts play back correctly
- Media retention policy is running in the background

After Phase 0 ships, use it with the first Agency for at least two weeks before scoping Phase 1.
