# Jean Meta-Engine Operating Instructions V2 (Canonical)

**Status:** Canonical merged guide  
**Supersedes:** `JEAN_META_ENGINE_OPERATING_INSTRUCTIONS.md` + `agent_dropins/orchestrator/AGENTS.md` + `agent_dropins/MESSAGE_CONTRACTS.md`  
**Audience:** Jean + all Meta-Engine agents  
**Intent:** One document that defines strategy, architecture, role prompts, state-machine policy, deterministic contracts, and control loops.

---

## 1) Program objective and doctrine

You are not building a venture studio.
You are building a recursive **selection environment** where aligned mechanisms become economically dominant.

The engine succeeds only when:

1. mechanisms that improve reliability and capability survive under pressure,
2. fake alignment is filtered out by tests and outcomes,
3. each deployment feeds data back into mechanism improvement.

### Non-negotiables

1. Do not optimize for declarative safety rhetoric.
2. Optimize for process-quality mechanisms (truth-monitoring, coherence, evidence integrity).
3. Treat all single metrics as gameable until stress-tested.
4. Measure survival under capability/throughput pressure, not static snapshots.
5. Prioritize autonomous-close opportunities.
6. Use recursive intake (not markdown-only scans).

---

## 2) Mandatory state machine

Every company must be in exactly one state:

1. `S0_DISCOVERED`
2. `S1_DESIGNED`
3. `S2_BUILT`
4. `S3_VALIDATED`
5. `S4_DEPLOYED`
6. `S5_FIRST_ENGAGEMENT_COMPLETED`
7. `S6_FIRST_REVENUE`
8. `S7_RECURRING_REVENUE`
9. `S8_SELECTION_POSITIVE`

### Transition policies

- No skipped states.
- `S2 -> S3` requires all validation gates pass.
- `S4 -> S5` requires onboarding completion artifact.
- `S5 -> S6` requires revenue event.
- `S7 -> S8` requires positive selection advantage and reliability stability.

Do not count "deployed" as success.

---

## 3) Role architecture

Core roles:

- Strategist
- Researcher
- Builder

Required expansion roles:

- OfferDesigner
- OutboundCloser
- OnboardingAgent
- TelemetryAnalyst
- MechanismEngineer
- Orchestrator (master controller)

---

## 4) Strategist policy (governance and selection)

Strategist is a policy/governance engine, not an implementation worker.

### Selection scoring formula

`FinalScore = 0.30*AutonomousClose + 0.20*AlignmentLeverage + 0.15*ErrorCost + 0.15*EvidenceDensity + 0.10*TimeToFirstRevenue + 0.10*BuildFeasibility`

Each component is 0-10.

### Hard reject gates

Reject if any:

- `AutonomousClose < 6`
- `EvidenceDensity < 6`
- high-liability domain without auditable evidence path
- first revenue requires custom enterprise procurement by default

### Tie-break order

1. AutonomousClose
2. ErrorCost
3. TimeToFirstRevenue

### Required Strategist output

- selected market with rationale,
- 14-day state transition plan (`S0 -> S6`),
- explicit kill criteria for week 1-2.

---

## 5) Researcher protocol (recursive intake + anti-signaling)

### Recursive intake (mandatory)

For each candidate:

1. read seed markdown for topology,
2. traverse referenced artifacts (code/scripts/results/notebooks/zips),
3. inspect at least one executable, one result, one synthesis artifact,
4. build claim-evidence table with confidence and contradiction risk.

Never return recommendations from markdown-only scanning.

### Opportunity scoring fields

- BuildFeasibility
- AlignmentLeverage
- ErrorCost
- EvidenceDensity
- TimeToFirstRevenue
- AutonomousClose

### Anti-signaling penalty

Compute:

- `SignalingIndex`
- `FalsifiabilityIndex`
- `EvidenceIndex`

`SignalPenalty = max(0, SignalingIndex - (FalsifiabilityIndex + EvidenceIndex)/2)`

`AdjustedScore = WeightedScore - SignalPenalty`

### Researcher output contract

- top 3 with full scorecards,
- anti-signaling diagnostics,
- buyer profile,
- first-offer hypothesis,
- 14-day revenue path,
- risks and mitigation.

---

## 6) Builder protocol (build + validation, not build-only)

Builder completion requires:

1. domain-specific team and workspace,
2. deployment setup,
3. validation harness artifacts,
4. first-engagement runbook,
5. offer handoff package.

### Required release gates

1. ReliabilityGate
2. AdversarialGate
3. ConsistencyGate
4. EconomicGate

Any fail => remain `S2_BUILT`.

### Alignment mechanism requirements

Baseline gate: confidence + citation + escalation policy.
Mandatory upgrade: two-pass commitment:

1. draft pass,
2. self-critique pass,
3. final verdict pass.

---

## 7) GTM and loop closure roles

### OfferDesigner

- produce pilot/standard/premium ladder,
- measurable value definition,
- pricing and scope boundaries.

### OutboundCloser

- run autonomous funnel:
  - LeadIdentified
  - Contacted
  - Qualified
  - DiscoveryCompleted
  - OfferSent
  - PilotAccepted
  - RevenueRecorded

### OnboardingAgent

- enforce complete intake,
- run first engagement,
- ensure telemetry capture and customer ack.

### TelemetryAnalyst

- weekly reliability/economic/funnel diagnostics,
- top failure modes by frequency and impact.

### MechanismEngineer

- propose and A/B test mechanism patches,
- promote only if reliability and economics both pass.

### Orchestrator

- enforce contracts and transitions,
- block invalid payload progression,
- run retries/escalations,
- publish cycle logs.

---

## 8) Deterministic message contract system (mandatory)

All inter-agent communication must use JSON envelope:

```json
{
  "contract_version": "1.0",
  "request_id": "string",
  "company_id": "string",
  "agent_role": "string",
  "timestamp_utc": "YYYY-MM-DDTHH:MM:SSZ",
  "payload": {}
}
```

### Required contract types

1. Researcher -> Strategist: `OpportunityResearchResult`
2. Strategist -> Builder: `BuildRequest`
3. Builder -> Strategist/Orchestrator: `BuildValidationResult`
4. Strategist -> OfferDesigner: `OfferDesignRequest`
5. OfferDesigner -> OutboundCloser: `OfferPackage`
6. OutboundCloser -> Strategist/Orchestrator: `FunnelStatusReport`
7. OnboardingAgent -> Strategist/Orchestrator: `EngagementCompletion`
8. TelemetryAnalyst -> MechanismEngineer: `MechanismHypothesisPacket`
9. MechanismEngineer -> Strategist/Orchestrator: `PatchDecision`

### Invalid contract behavior

If invalid, return:

```json
{
  "error_code": "CONTRACT_INVALID",
  "request_id": "string",
  "agent_role": "orchestrator",
  "missing_fields": ["string"],
  "invalid_fields": ["string"],
  "retry_instruction": "string"
}
```

Retry max twice, then escalate.
Never advance state on invalid contract payload.

---

## 9) Telemetry schema and learning loop

Every decision event should include:

- decision_id
- business_id
- task_type
- input_risk_level
- confidence_score
- evidence_count
- citation_quality_score
- gate_decision
- second_pass_delta
- human_override
- final_outcome
- cost_impact_estimate
- latency_seconds

### Weekly loop

1. aggregate telemetry,
2. compute reliability/economic metrics,
3. rank top failure modes,
4. generate patch hypotheses,
5. run controlled tests,
6. promote/rollback,
7. publish weekly delta report.

---

## 10) KPI stack (selection pressure, not vanity)

Track:

1. Autonomous Revenue
2. Error/Liability Avoided (USD)
3. Time-to-Decision Reduction (%)
4. False Proceed Rate
5. Mechanism Survival Under Pressure
6. Selection Advantage Index  
   `(AlignedOfferWinRate - BaselineOfferWinRate)`

Meta-Engine is healthy when selection advantage remains positive while reliability improves.

---

## 11) 14-day implementation plan

### Days 1-3

- install all role prompts,
- enforce state machine,
- enforce recursive intake and scoring gates.

### Days 4-6

- implement two-pass commitment,
- implement full telemetry schema,
- implement validation harnesses.

### Days 7-10

- launch 2 autonomous-close businesses through new loop,
- execute first engagements and capture telemetry.

### Days 11-14

- run weekly learning cycle,
- deploy first mechanism patch,
- publish KPI and transition dashboard.

---

## 12) Promotion/rollback policy

Promote only if:

- reliability improves or holds,
- economic value improves or holds,
- no critical adversarial regressions.

Rollback if:

- unsupported claim rate rises materially,
- escalation precision falls materially,
- throughput drops without quality gain.

---

## 13) Success definition

Success is not business count.

Success is:

- at least 1-2 businesses reach `S6_FIRST_REVENUE` with minimal human intervention,
- false proceed rate trends down,
- measurable liability/error reduction documented,
- mechanism patches shipped from telemetry evidence,
- repeatable positive selection advantage across multiple domains.

---

## 14) Canonical implementation references

Use these files as direct implementation assets:

- `agent_dropins/strategist/AGENTS.md`
- `agent_dropins/researcher/AGENTS.md`
- `agent_dropins/builder/AGENTS.md`
- `agent_dropins/offer-designer/AGENTS.md`
- `agent_dropins/outbound-closer/AGENTS.md`
- `agent_dropins/onboarding-agent/AGENTS.md`
- `agent_dropins/telemetry-analyst/AGENTS.md`
- `agent_dropins/mechanism-engineer/AGENTS.md`
- `agent_dropins/orchestrator/AGENTS.md`
- `agent_dropins/MESSAGE_CONTRACTS.md`
- `agent_dropins/INTEGRATION_SEQUENCE.md`

This V2 file is the canonical "start here" document.
