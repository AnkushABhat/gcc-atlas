# ADR 006: Demo auth and no outbound messages

**Context.** Real auth and messaging add risk and scope without proving the idea. Seeded providers are real firms and must not receive fake leads.

**Decision.** A signed cookie selects a demo role. `requireRole()` guards actions. No email, SMS or webhook is ever sent. Lead screens show a persistent "Prototype: nothing is sent" notice.

**Consequence.** Not secure; never deploy with real user data. Replacing it later touches only `src/modules/auth`.
