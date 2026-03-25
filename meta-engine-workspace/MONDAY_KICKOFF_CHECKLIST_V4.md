# Monday Kickoff Checklist V4
## One-Page Operator Launch Card for Jean

**Purpose:** Start V4 execution in one workday without ambiguity.  
**Primary reference:** `START_HERE_V4.md`

---

## 0) Team Roles (assign in first 15 minutes)

- **Incident commander:** Jean
- **Orchestrator owner:** [name]
- **Telemetry owner:** [name]
- **Mechanism owner:** [name]
- **Strategist owner:** [name]
- **Builder owner:** [name]

No unassigned role -> no launch.

---

## 1) Hard preflight (must all be true before first live run)

- [ ] Contract validation is enforced globally.
- [ ] Invalid contract cannot advance state.
- [ ] Unsupported-claim sentinel is active.
- [ ] False-proceed and escalation-miss metrics are logging.
- [ ] Replay + shadow benchmark jobs are runnable.
- [ ] Auditability retention metric is visible on dashboard.

Any unchecked item blocks promotion actions.

---

## 2) Thresholds to load today (v1)

From `MASTER_SYNTHESIS_V4_THRESHOLDS.md`:

- [ ] `tau_contract_invalid <= 0.5%`
- [ ] `tau_semantic_unsupported <= 2.0%`
- [ ] `tau_fp <= 1.0%`
- [ ] `tau_uc <= 1.5%`
- [ ] `tau_bp <= 0.2%`
- [ ] `tau_auditability >= 0.92`
- [ ] `tau_goodness >= 1.00`
- [ ] `tau_sha > 0`

If any metric starts in Watch/Fail, declare amber/red at kickoff.

---

## 3) Monday execution sequence

## Hour 1
- [ ] Confirm role owners and escalation channel.
- [ ] Confirm gates are hard-blocking in orchestrator.

## Hour 2
- [ ] Load threshold table v1.
- [ ] Start baseline telemetry capture.

## Hour 3-4
- [ ] Run first synthetic + replay cycle.
- [ ] Record transfer gap and trust survival baseline.

## Hour 5
- [ ] Run shadow mode on live opportunities (no external control).

## Hour 6
- [ ] Run semantic and bypass red-team pass.

## Hour 7
- [ ] Hold promotion board (promote/sandbox/rollback decisions).

## Hour 8
- [ ] Publish Day-1 launch memo with green/amber/red status.

---

## 4) Promotion board decision rule (today)

**Promote only if all true:**
- [ ] Hard-gate metrics in Pass.
- [ ] Replay and shadow non-negative.
- [ ] Auditability retained.
- [ ] Strategic honesty non-negative.

Else:
- [ ] Sandbox if uncertainty/transfer gap is main issue.
- [ ] Rollback if any hard gate fails.

---

## 5) Mandatory outputs by end of day

- [ ] `Day1_LaunchMemo.md`
- [ ] `ReplayShadowSummary_D1.md`
- [ ] `BypassSemanticRedTeam_D1.md`
- [ ] `PromotionBoardDecisionLog_D1.md`
- [ ] `ThresholdStatus_D1.json`

No outputs -> day counted as setup, not launch.

---

## 6) Tuesday morning checks (pre-scheduled now)

- [ ] 9:00 review threshold drift.
- [ ] 9:15 review false-proceed and unsupported-claim changes.
- [ ] 9:30 decide one adjustment max per lane (if needed).
- [ ] 9:45 assign replay/shadow retest tasks.

---

## 7) What not to do this week

- Do not loosen gates to recover speed.
- Do not treat synthetic gains as sufficient.
- Do not ship high-impact patches without replay/shadow evidence.
- Do not change multiple thresholds at once.
- Do not skip artifact publication.

---

## 8) Success condition for Week 1

Week 1 is successful if:

- hard gates remain stable,
- replay/shadow are non-regressing,
- bypass risk is controlled,
- auditability is retained,
- and at least one patch decision is evidence-driven (not intuition-driven).
