# modules/auth

Demo roles only. ADR 006. Not secure. Never use for real users.

## Interface (`index.ts`)
`getSession()`, `setDemoSession({role, providerSlug?})`, `requireRole(role, {providerSlug?})`.

## Rules
- Roles: `buyer` (default, no cookie needed), `provider` (needs `providerSlug`), `admin`.
- Session is a cookie signed with HMAC using `SESSION_SECRET`. Reject unsigned or tampered cookies and fall back to `buyer`.
- Every server action that mutates or reveals non-public data calls `requireRole` first. A missing call is a bug.
- The role switcher is visible in the header on every page, labeled "Demo mode".
