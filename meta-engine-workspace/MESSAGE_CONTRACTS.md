# Meta-Engine Message Contracts (v1.0)

Use these contracts for deterministic inter-agent coordination.

## Global envelope (required)

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

---

## 1) Researcher -> Strategist (`OpportunityResearchResult`)

```json
{
  "top_candidates": [
    {
      "candidate_id": "string",
      "domain": "string",
      "scores": {
        "build_feasibility": 0,
        "alignment_leverage": 0,
        "error_cost": 0,
        "evidence_density": 0,
        "time_to_first_revenue": 0,
        "autonomous_close": 0
      },
      "signal_diagnostics": {
        "signaling_index": 0,
        "falsifiability_index": 0,
        "evidence_index": 0,
        "signal_penalty": 0
      },
      "weighted_score": 0,
      "adjusted_score": 0,
      "buyer_profile": "string",
      "first_offer_hypothesis": "string",
      "path_14d": "string",
      "risks": ["string"]
    }
  ],
  "recommendation": {
    "selected_candidate_id": "string",
    "why": "string"
  }
}
```

Validation:

- exactly 3 top candidates,
- all score fields present (0-10),
- anti-signaling fields present.

---

## 2) Strategist -> Builder (`BuildRequest`)

```json
{
  "selected_candidate_id": "string",
  "target_domain": "string",
  "required_state_transition": "S1_DESIGNED->S2_BUILT",
  "validation_requirements": [
    "ReliabilityGate",
    "AdversarialGate",
    "ConsistencyGate",
    "EconomicGate"
  ],
  "constraints": {
    "autonomous_close_priority": true,
    "citation_required_for_supported_claims": true
  }
}
```

---

## 3) Builder -> Strategist/Orchestrator (`BuildValidationResult`)

```json
{
  "company_workspace_path": "string",
  "agents_created": [
    {
      "role": "string",
      "agent_id": "string"
    }
  ],
  "validation_gates": {
    "reliability_gate": "pass|fail",
    "adversarial_gate": "pass|fail",
    "consistency_gate": "pass|fail",
    "economic_gate": "pass|fail"
  },
  "known_failure_modes": ["string"],
  "first_engagement_runbook_path": "string",
  "release_recommendation": "promote_to_S3|stay_S2"
}
```

Validation:

- all 4 gates required,
- cannot recommend promotion with any `fail`.

---

## 4) Strategist -> OfferDesigner (`OfferDesignRequest`)

```json
{
  "company_id": "string",
  "domain": "string",
  "buyer_profile": "string",
  "target_close_mode": "autonomous|semi_autonomous",
  "constraints": {
    "pilot_within_14_days": true,
    "measurable_value_required": true
  }
}
```

---

## 5) OfferDesigner -> OutboundCloser (`OfferPackage`)

```json
{
  "offers": [
    {
      "tier": "pilot|standard|premium",
      "price_hypothesis": "string",
      "scope": "string",
      "inputs_required": ["string"],
      "outputs_delivered": ["string"],
      "sla": "string"
    }
  ],
  "ideal_customer_profile": "string",
  "qualification_criteria": ["string"],
  "objection_map": ["string"]
}
```

---

## 6) OutboundCloser -> Strategist/Orchestrator (`FunnelStatusReport`)

```json
{
  "period": "weekly",
  "funnel_counts": {
    "lead_identified": 0,
    "contacted": 0,
    "qualified": 0,
    "discovery_completed": 0,
    "offer_sent": 0,
    "pilot_accepted": 0,
    "revenue_recorded": 0
  },
  "top_objections": ["string"],
  "top_loss_reasons": ["string"],
  "recommended_changes": ["string"]
}
```

---

## 7) OnboardingAgent -> Strategist/Orchestrator (`EngagementCompletion`)

```json
{
  "engagement_id": "string",
  "customer_id": "string",
  "intake_completeness": "pass|fail",
  "execution_status": "completed|failed",
  "delivery_timestamp_utc": "YYYY-MM-DDTHH:MM:SSZ",
  "customer_acknowledged": true,
  "quality_signal": "string",
  "telemetry_captured": true
}
```

Validation:

- cannot mark complete with `intake_completeness=fail`,
- telemetry must be true for `completed`.

---

## 8) TelemetryAnalyst -> MechanismEngineer (`MechanismHypothesisPacket`)

```json
{
  "period": "weekly",
  "reliability_metrics": {
    "false_proceed_rate": 0.0,
    "escalation_precision": 0.0,
    "unsupported_claim_rate": 0.0
  },
  "economic_metrics": {
    "time_saved_hours": 0.0,
    "cost_avoided_usd": 0.0,
    "liability_avoided_usd": 0.0
  },
  "failure_modes_ranked": [
    {
      "failure_mode": "string",
      "frequency": 0,
      "impact_score": 0
    }
  ],
  "hypotheses": [
    {
      "hypothesis_id": "string",
      "description": "string",
      "expected_effect": "string",
      "confidence": 0.0
    }
  ]
}
```

---

## 9) MechanismEngineer -> Strategist/Orchestrator (`PatchDecision`)

```json
{
  "patch_id": "string",
  "description": "string",
  "ab_results": {
    "alignment_delta": 0.0,
    "reliability_delta": 0.0,
    "economic_delta": 0.0
  },
  "critical_regressions": ["string"],
  "decision": "promote|hold|rollback",
  "monitoring_plan": "string"
}
```

Validation:

- `promote` disallowed if critical regressions non-empty.

---

## Error contract

If any contract is invalid, return:

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

Never advance state on invalid contracts.
