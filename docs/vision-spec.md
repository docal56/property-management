# Vision Spec

This is the long-term product vision. It describes the full product across all phases.

**Not for coding agents during implementation.** Coding agents should load `product-spec.md`, which defines the currently active phase. This document is a strategic reference for humans and for decisions where the long-term shape matters.

---

## 1. Concept

A multi-tenant SaaS product for estate agents (UK). AI Phone Agents answer inbound calls on behalf of the agency; a web app lets the team triage, track, and resolve whatever comes out of those calls.

MVP covers two Phone Agent types:
- **Property Management Agent** — tenants call about issues with their rental property
- **Out of Hours Agent** — captures missed-call leads when the main line isn't answered

The team works in a web app containing Inboxes, Managed Properties, and Contacts.

---

## 2. Terminology

| Term | Meaning |
|---|---|
| Agency / Estate Agent | The customer business (our tenant). |
| User / Team Member | A human employee of the Agency using the web app. |
| AI Agent / Phone Agent | An ElevenLabs voice bot that answers calls. |
| Property Management Agent | Phone Agent for tenant-reported issues. |
| Out of Hours Agent | Phone Agent for missed-call lead capture. |
| Managed Property | A property the Agency manages. Issues are attached to Properties. |
| Contact | A person (tenant, lead, buyer, past tenant). One record per person. |
| Issue | A property-related problem reported by a tenant. Lives against a Property. |
| Enquiry | A lead's expression of interest in a property. Lives against a Contact. |
| Event | A single interaction within an Issue or Enquiry (call, text, photo). |

---

## 3. User Roles

Two roles within an Agency:

**Admin / Owner**
- Manages team members (invite, remove, role changes)
- Manages Agency settings (business hours, phone numbers, branding)
- Full access to everything a Team Member has
- Can import/export Managed Properties and Contacts

**Team Member**
- Works the Inbox day-to-day
- Manages their own user settings (email, password, notification preferences)
- Can view, edit, assign Issues and Enquiries
- Can upload media manually to Issues
- Cannot manage other users or Agency-level settings

No cross-Agency access. A User belongs to one Agency.

---

## 4. Core Entities

### Agency
The tenant. All other records scope to an Agency.
- Name, address, branding
- Business hours (used for out-of-hours routing)
- Phone numbers (assigned from provisioning pool)

### User
A person with login access.
- Belongs to one Agency
- Role (Admin/Team Member)
- Email, name, password (via Clerk)
- Notification preferences

### Managed Property
A property the Agency manages.
- Address (full UK address with postcode)
- Current tenant (Contact reference; nullable)
- Tenant history (list of Contact references with start/end dates)
- Issue history (all Issues attached to this Property)
- Agency-specific fields (optional: type, bedrooms, notes)

### Contact
A person. Unified model for tenants, leads, buyers, etc.
- Name, phone number, email
- Current status (tenant, lead, buyer, past tenant, past lead)
- Property relationships (current tenancy, past tenancies, enquiries)
- Issue history (across all properties they've been tenant of)
- Enquiry history
- Free-text notes (agency-added context)

**Status is current state, not type.** A Contact can move between statuses over time.

### Issue
A property-related problem.
- Attached to a Managed Property (required)
- Attached to the Contact who reported it (usually the current tenant)
- AI-generated structured summary (property, tenant, issue description)
- Urgent flag (boolean) — set by the AI Agent based on rules in its prompt
- Status (New / In Progress / Contractor Scheduled / Awaiting Follow-up / Resolved). "Resolved" is the single end state in Phase 0 and covers both fixed-and-done and no-action-needed cases. A separate Closed-No-Action state is deferred.
- Assigned User (nullable)
- Structured fields (contractor name, scheduled date, cost estimate) — added over time
- Free-text notes (timestamped, attributed)
- Events timeline (all interactions)
- Media attachments (photos, videos, audio recording, transcript)
- Created/updated timestamps
- Resolved timestamp (used for media retention)

### Enquiry (Phase 2)
A lead's expression of interest.
- Attached to a Contact (required)
- Optionally attached to a Managed Property (the one they enquired about)
- AI-generated summary
- Status (New / In Progress / Awaiting Follow-up / Resolved / Closed-No-Action)
- Assigned User
- Notes, events, media, timestamps

### Event
An interaction within an Issue or Enquiry.
- Type (call, sms, whatsapp_media, email_media, note, status_change, assignment_change, field_change)
- Timestamp
- Actor (AI Agent, specific User, system)
- Payload (transcript, audio URL, media file reference, note content, field diff)

### Media
A file attached to an Issue or Event.
- Type (photo, video, audio)
- Source (voice recording, manual upload by Team Member)
- File reference (Convex storage ID or ElevenLabs URL for audio)
- Uploaded by (User reference, nullable — null for system-captured audio)
- Scheduled-for-deletion timestamp (nullable)

---

## 5. Phone Agents

Two AI Agents, both built in ElevenLabs. Prompts managed by Anthropic-paid operator (not the Agency) during MVP.

### 5.1 Property Management Agent

**Purpose:** capture tenant-reported issues in a structured form.

**Flow:**
1. Tenant calls dedicated number.
2. AI Agent greets, confirms caller's name.
3. AI Agent asks for property address and matches it against the Agency's Managed Properties. (Uses tenant name + address for verification.)
4. AI Agent asks what the issue is, probes for detail and urgency.
5. AI Agent asks tenant to send a photo/video to the Agency directly (to the Agency's own phone number or email — whatever they've communicated to their tenants). AI Agent asks the tenant to include the property address in the message for identification.
6. AI Agent confirms details back to tenant.
7. Call ends. AI Agent writes structured summary.

Media handling is manual in MVP: the Agency receives the photo/video on their own channel; a Team Member uploads it to the Issue in the app when triaging.

**Required data captured:**
- Property address (matched to Managed Property)
- Tenant name (matched to Contact)
- Tenant phone number (confirmed on call, used for media matching)
- Issue description
- Urgent flag (inferred by the AI Agent from rules in the prompt — e.g. no heating, flooding, security issue. Not asked directly; callers default to "urgent" if asked.)
- Photo/video request acknowledged

**Outputs to the system:**
- New Issue record linked to matched Property and Contact
- Events timeline seeded with the call (transcript + audio URL)
- Structured summary populated
- Status set to "New"

**Failure modes to handle:**
- Property not matched → Issue created in an "Unmatched" bucket for a Team Member to resolve manually.
- Tenant not matched → Issue created, flagged for Team Member review.
- Caller refuses to give details → partial Issue created with whatever was captured.

### 5.2 Out of Hours Agent (Phase 2)

**Purpose:** capture missed-call leads so the Agency doesn't lose enquiries after hours.

**Routing:**
- Agency configures call forwarding on their main line: outside business hours, calls forward to this AI Agent's Twilio number.
- Business hours are set in the Agency's settings.

**Flow:**
1. Caller reaches AI Agent.
2. AI Agent greets, captures caller name, contact number, email.
3. AI Agent asks what they're calling about (specific property, general enquiry, etc.).
4. If a specific property, AI Agent captures which one.
5. AI Agent confirms a team member will call back in business hours.
6. Call ends. AI Agent writes structured summary.

**Required data captured:**
- Caller name
- Phone number (confirmed)
- Email (optional)
- Enquiry subject (property address if applicable, general topic otherwise)
- Best time to call back (optional)

**Outputs to the system:**
- Contact record created (or matched if phone number already exists)
- Contact status set to "lead" unless already another status
- Enquiry record created, linked to the matched Property if identified
- Events timeline seeded with the call
- Status set to "New"

---

## 6. Channels

Inbound channels the system accepts automatically:

| Channel | Purpose | MVP | Notes |
|---|---|---|---|
| Voice call | Primary interaction | Yes | Via Twilio + ElevenLabs |
| SMS | Same as voice, just text | Yes | AI Agent responds via text; session ends after 30 min silence |

**Media handling in MVP:**
- The system does **not** automatically ingest photos/videos from any channel.
- The AI Agent instructs tenants to send media directly to the Agency (via the Agency's own phone number or email — configured outside this app).
- Team Members upload media manually to the relevant Issue when triaging.

**Automated media ingestion (email or WhatsApp) is an explicit fast-follow after MVP** — see section 17 and section 18.

**One Issue, many Events:** voice call, follow-up text, and manually uploaded media all land on the same Issue as a timeline of Events. Team Member sees a unified view.

---

## 7. Inboxes

Separate Inboxes per Phone Agent type, per Agency.

### 7.1 Property Management Inbox

**List view:**
- Rows: Issues, most recent first by default
- Default sort: newest; sortable by urgency, status, last activity
- Filter by: status, assigned User, urgent, date range
- Search: free-text across tenant name, property address, issue summary
- Per-row display: property address, tenant name, AI summary (truncated), urgent badge (if flagged), status, assigned User avatar, last activity timestamp

**Actions from list:**
- Click row → open Issue detail
- Bulk select → bulk status change, bulk assign (Phase 2)

### 7.2 Lead Capture Inbox (Phase 2)

Same pattern, for Enquiries.

---

## 8. Issue Detail

Where the team does the work. Layout:

**Top section — summary panel:**
- Property address (links to Managed Property page)
- Tenant name (links to Contact page)
- AI-generated summary (editable by Team Member if wrong)
- Urgent badge (if flagged)
- Status selector (dropdown)
- Assigned User selector

**Middle section — structured fields:**
- Contractor name
- Scheduled date
- Cost estimate
- (Agency can extend this list — configurable fields are post-MVP; start with hardcoded set)

**Content section — tabbed or stacked:**
1. **Media** — photos and videos (thumbnails, click to enlarge), audio recording player. Includes a manual **upload** control for Team Members to add photos/videos received outside the system.
2. **Transcript** — full AI Agent conversation
3. **Notes** — chronological free-text notes, each timestamped and attributed to the User who wrote it. Input at the bottom.
4. **Activity / History** — full audit log: status changes, assignments, field edits, notes added, media added. Collapsible or separate tab.

**Note and event model:** notes and status changes are all Events. The Activity tab shows all Events; the Notes tab filters to note-type Events for quick triage.

---

## 9. Managed Properties

### List view
- Rows: Properties
- Columns: address, current tenant, open issues count, last activity
- Search: address
- Filter: has-open-issues, no-current-tenant

### Detail view
- Property details (address, agency-specific fields)
- Current tenant (Contact reference; link to Contact)
- Tenant history (past tenants with dates)
- All Issues for this Property (open + closed, filterable)

**Editing:**
- Admin can edit property fields
- Setting/changing current tenant closes the previous tenancy and opens a new one

---

## 10. Contacts

Unified list. Tenants, leads, buyers — one record per person.

### List view
- Columns: name, phone, email, status, properties linked, last interaction
- Filter by: status (tenant / lead / buyer / past tenant / past lead), last interaction date
- Search: name, phone, email

### Detail view
- Contact info (name, phone, email, status)
- Property relationships:
  - Current tenancy (if any)
  - Past tenancies
  - Enquiries (Phase 2)
- Interaction history: all Issues and Enquiries they've been involved in, chronological
- Free-text notes (agency-added context)

---

## 11. Settings

### Agency Settings (Admin only)
- Agency name, address, logo
- Business hours (used for out-of-hours routing; Phase 2)
- Phone numbers assigned (read-only; set by operator during onboarding)
- Custom fields on Issues (Phase 2)

### Team Management (Admin only)
- List of current Users with roles
- Invite new User (by email)
- Change role
- Remove User
- Pending invitations

### User Settings (self-service)
- Name, email
- Password (via Clerk)
- Notification preferences
- Email signature (Phase 2)

---

## 12. Onboarding

Handled manually by the product operator for MVP. **No onboarding UI in the app.** All setup is done directly against the database or via back-office scripts.

**Per new Agency:**
1. Create Agency record in the database
2. Assign phone numbers from Twilio pool
3. Wire up AI Agents to those numbers (ElevenLabs config)
4. Import Managed Properties and current tenants directly into the database
5. Create the first Admin User and send them a Clerk invite
6. Admin invites their team from within the app

**Data import:**
- Properties: address, current tenant name, current tenant phone, current tenant email
- Creates Property + Contact records, links them as current tenancy
- Mechanism is operator-run (CSV-to-DB script or direct insert) — no user-facing import in MVP

---

## 13. Notifications

**MVP: email only.**

Triggers:
- New Issue lands in Inbox → email all Users at the Agency (or configurable subset)
- Issue assigned to a User → email that User
- Issue status changed to "Awaiting Follow-up" → email assigned User
- New note added to an Issue assigned to a User → email that User

User notification preferences:
- Toggle each category on/off
- Digest option (Phase 2)

No SMS, push, or in-app notifications in MVP.

---

## 14. Audit Trail

Every change to an Issue, Enquiry, Contact, or Managed Property is logged as an Event.

Events captured:
- Record created
- Status changed (with from/to)
- Assignment changed (with from/to)
- Field edited (with from/to)
- Note added
- Media added
- Media deleted (by retention policy)

**Display:**
- Activity tab on the detail view
- Each entry shows: timestamp, User (or "AI Agent" / "System"), action, before/after values

---

## 15. Search & Filtering

Scope for MVP:

**Inbox:**
- Filter: status, assigned User, urgent, date range
- Search: tenant name, property address, issue summary

**Properties list:**
- Filter: has-open-issues, no-current-tenant
- Search: address

**Contacts list:**
- Filter: status
- Search: name, phone, email

**Global search (Phase 2):** single bar across all entities.

---

## 16. Media Retention

**Policy:**
- Media (photos, videos) linked to Issues is **soft-deleted 90 days after the Issue is marked Resolved**.
- Soft-delete means: file remains for 7 days in a recovery window; after that, permanently deleted.
- Audio recordings follow the same policy.
- Transcripts are text — kept indefinitely.
- Notes are kept indefinitely.

**Implementation:**
- A scheduled job runs daily, finds Issues resolved more than 90 days ago with non-deleted media, marks them scheduled-for-deletion.
- A second job runs daily, permanently deletes media scheduled-for-deletion more than 7 days ago.
- Deletion is recorded as an Event on the Issue.

---

## 17. Out of Scope for MVP

Explicitly **not** in scope for MVP:
- Separate Closed-No-Action status (Phase 0 uses Resolved for both fixed and no-action-needed)
- Automated media ingestion (email, WhatsApp, or otherwise) — fast-follow after MVP
- Billing and payments
- Phone Agent self-service configuration (Agency tweaking prompts)
- Native mobile apps
- Advanced search (global / faceted / semantic)
- Bulk actions on Inbox items
- Configurable custom fields on Issues
- SMS/push/in-app notifications
- Self-service Agency signup
- User-facing onboarding / data import UI
- Multiple AI Agents per category within one Agency
- Reporting/analytics dashboards
- Integrations with external property management software
- Calendar integration for contractor scheduling
- Tenant-facing portal
- Lead-to-property many-to-many relationships (one Enquiry per call is fine)

---

## 18. Phasing

### Phase 0 — Minimum validation slice

The tightest possible slice that lets the first Agency use the product end-to-end and validates the core loop: call comes in → AI Agent captures structured Issue → Admin triages and works the Issue → closes it when resolved.

**In scope for Phase 0:**
- Agency, Managed Property, Contact, Issue entities
- Admin-only account model (no Team Member role, no per-User assignment)
- Clerk auth for Admin sign-in
- Property Management Phone Agent integration (call → Issue creation, captures transcript + audio)
- Two pages only:
  - Open Issues (list grouped by status; collapsed "Closed" section at the bottom for Resolved issues)
  - Call Logs (metrics + calls table, filtered by date range)
- Issue slide-over panel with:
  - Status dropdown
  - "Contractor for the job" free-text field
  - AI-captured Details block (address, tenant name, tenant contact, issue description)
  - Manual media upload (photos/videos)
  - Call recording playback
  - Full transcript
  - Copy Details button (copies the Details block for pasting into contractor messages)
  - Up/down keyboard navigation between issues
- Urgent flag on Issues (set by AI Agent based on prompt rules; displayed as a badge)
- Search on Open Issues (simple text search; no filters)
- Pass Rate + Call Status metric (defined below)
- Media retention policy (90-day rule from Resolved timestamp)

**Explicitly deferred from Phase 0 (moved to later phases):**
- Team Member role and per-User assignment
- Notes on Issues
- Email notifications
- Filters on Open Issues (search only)
- Managed Properties, Contacts, Settings pages
- Audit trail UI (data may still be captured but no surfaced view)
- Separate Closed-No-Action status (covered by Resolved in Phase 0)
- Empty / loading / error state designs (handled at implementation)
- Settings / user profile UI (no settings icon in sidebar)

**Pass Rate and Call Status definition:**
- A call is "Success" if all four required Issue fields were captured: property address, tenant name, tenant contact number, issue description.
- A call is "Failed" if any of those four fields was not captured.
- Pass Rate = Success ÷ Total calls, over the selected date range.
- The selected date range affects both the metrics and the logs table.

**Human checkpoint after Phase 0:** ship to first Agency, use it for real, learn what the team actually needs next.

### Phase 1 — Property Management MVP (originally scoped)

*(Kept as the longer-term target. Items here that were in Phase 1 but are now deferred behind Phase 0 roll forward into Phase 1 or later.)*

Everything needed to run the Property Management loop end-to-end:
- Agency, User (Admin + Team Member), Managed Property, Contact (tenant status only), Issue entities
- Clerk auth with Organisations
- Property Management Phone Agent integration (call → Issue creation, captures transcript + audio)
- Property Management Inbox (list + filters + search)
- Issue detail (summary, media with manual upload, transcript, audio, notes, status, assignment, activity)
- Managed Properties list + detail
- Contacts list + detail (tenant-only in Phase 1)
- Settings: Agency settings, Team management, User settings
- Email notifications
- Audit trail
- Media retention policy (90-day rule)

**Human checkpoint before Phase 1.5:** use the system with the first Agency for at least 2 weeks. Learn what the team actually does. Refine before expanding.

### Phase 1.5 — Automated Media Ingestion (fast-follow)

- Remove manual-upload friction
- Automatic ingestion via email and/or WhatsApp with matching to the right Issue by sender + property address included in the message
- Channel choice and scope decided based on real usage patterns from Phase 1

### Phase 2 — Out of Hours + Lead Capture

- Out of Hours Phone Agent integration
- Business hours configuration in Agency settings
- Lead Capture Inbox
- Enquiry entity
- Contact statuses beyond tenant (lead, buyer, past tenant, past lead)
- Enquiry → Property linking

### Phase 3 — Scaling and Polish

- Billing (Stripe)
- Self-service Agency signup
- Advanced search
- Configurable custom fields
- Bulk actions
- Digest email notifications
- Reporting

### Phase 4 — Further Expansion

- Native mobile app (if demand justifies)
- No-answer forwarding for main line (not just out-of-hours time-based)
- Agency self-service for AI Agent prompt tweaks
- Tenant-facing portal

---

## 19. Open Questions

Deferred, to be resolved during build or post-launch:

- **Contractor field** — free-text vs. Agency-managed contractor list. Deferred until there's real usage data to inform it.
- **Unmatched-property handling** — where these sit in the UI, who gets notified. To be resolved during design.
