# Meta Engine MVP Plan
**Goal: one product at S6_FIRST_REVENUE in 14 days**

Last updated: 2026-03-19

---

## Phase 1 — Fix the pipeline (Day 1)
**Status: 🔄 In progress**

The pipeline exists but isn't reliable. Three specific fixes:

- [ ] Rewrite Strategist AGENTS.md — shorter, single-focus, explicit handoff to Researcher
- [ ] Rewrite Researcher AGENTS.md — add anti-signaling filter (simple version), explicit handoff to Architect via Strategist
- [ ] Rewrite Architect AGENTS.md — tighten, explicit handoff to Developer
- [ ] Rewrite Developer AGENTS.md — tighten, explicit handoff to Validator
- [ ] Fix Validator AGENTS.md — replace AuthGate with EconomicGate (does the product produce output someone would pay for?), keep AuthGate too
- [ ] Rewrite Deployer AGENTS.md — tighten, explicit handoff to OfferDesigner

**Root causes being fixed:**
- Agents hit max turns because AGENTS.md files are too long
- Agents assign tasks to themselves instead of next agent
- Handoff agent IDs not hardcoded → agents don't know who to delegate to

---

## Phase 2 — Close the revenue gap (Day 2)
**Status: ⏳ Pending**

Write the two missing AGENTS.md files:

- [ ] Write OfferDesigner AGENTS.md — takes a deployed product, writes pricing page, packages as clear service SKU ($X/audit, $X/report), posts to Paperclip, hands off to OutboundCloser
- [ ] Write OutboundCloser AGENTS.md — finds 10 real potential customers per product, drafts outreach, moves company to S5 on first engagement, hands off to OnboardingAgent

---

## Phase 3 — Clean run (Day 3)
**Status: ⏳ Pending**

- [ ] Trigger one "Do it" issue from portfolio page
- [ ] Do NOT manually intervene — let it run autonomously
- [ ] Watch full pipeline: Strategist → Researcher → Architect → Developer → Validator → Deployer → OfferDesigner → OutboundCloser
- [ ] First product reaches S4_DEPLOYED

---

## Phase 4 — Railway deploy (Day 4–5)
**Status: ⏳ Pending**

- [ ] Deploy first working product to Railway
- [ ] Judd uses it as a real user → S5_FIRST_ENGAGEMENT_COMPLETED
- [ ] First revenue → S6_FIRST_REVENUE

---

## Post-MVP (after first revenue)
These are real and important but need live data first:

- ConstitutionalAdversary agent
- Full telemetry schema (decision_id, confidence, second_pass_delta, etc.)
- Replay/shadow benchmark infrastructure
- Two-pass commitment pattern in Operator agents
- Automated weekly learning loop (TelemetryAnalyst → MechanismEngineer)

---

## Context
- Judd's thesis (APSPI): honest self-modeling → better performance → higher revenue → replication
- The products we build (compliance operators, accessibility checkers) ARE the live test
- Every paying user of an uncertainty-gated product is a data point for alignment-positive selection pressure
- Full V4.1 spec lives in: `/Users/andrerodrigues/Downloads/ralph 2/outputs/meta_engine_support_20260316_172522/`
