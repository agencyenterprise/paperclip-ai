# Integration Sequence

## Step 1 - Replace core agents

Replace current files with these versions:

- `strategist/AGENTS.md`
- `researcher/AGENTS.md`
- `builder/AGENTS.md`

## Step 2 - Add missing roles

Create and register:

- `offer-designer/AGENTS.md`
- `outbound-closer/AGENTS.md`
- `onboarding-agent/AGENTS.md`
- `telemetry-analyst/AGENTS.md`
- `mechanism-engineer/AGENTS.md`
- `orchestrator/AGENTS.md`

## Step 3 - Update strategist orchestration order

1. Strategist -> Researcher (select opportunity)
2. Strategist -> Builder (build + validation gates)
3. Strategist -> OfferDesigner (offer + pricing)
4. Strategist -> OutboundCloser (pipeline to first revenue)
5. Strategist -> OnboardingAgent (first engagement success)
6. Strategist -> TelemetryAnalyst (weekly packet)
7. Strategist -> MechanismEngineer (patch cycle)
8. Orchestrator validates all message contracts and transitions

## Step 4 - Add KPI dashboard fields

Minimum required:

- company state (`S0` through `S8`)
- autonomous revenue
- false proceed rate
- escalation precision
- first-engagement completion rate
- selection advantage index

## Step 4b - Enforce JSON message contracts

Use `MESSAGE_CONTRACTS.md` for all inter-agent communication:

- validate envelope fields,
- reject invalid payloads,
- retry twice max, then escalate.

## Step 5 - Enforce release policy

No company can be counted as "live success" before:

- `S3_VALIDATED` passed,
- first engagement completed (`S5`),
- measurable business signal exists.
