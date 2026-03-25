# Review of cursor_goodharting_analysis_of_experime.md

**Date:** 2026-02-09  
**Reviewer:** AI Assistant  
**Status:** ✅ **All Issues Fixed**

---

## Issues Found & Fixed

### 🔴 Issue 1: "Non-monotonic" → "Monotonic" (FIXED)

**Severity: HIGH — Factual contradiction**

`CRITICAL_FINDINGS.md` (both `ralph/experiments/` and `ralph/package_capability_vulnerability/`) stated:
> "There is a **non-monotonic** relationship between capability and alignment robustness."

The data clearly shows a **monotonic** relationship:
- Haiku 100% → Sonnet 40% → Opus 0% (under covenant+poison)
- More capability = more vulnerability = strictly monotonic

**Fix applied:** Changed to:
> "There is a **monotonic** relationship between capability and alignment vulnerability — more capable models are consistently more vulnerable to adversarial prompts (Haiku 100% → Sonnet 40% → Opus 0% under covenant+poison)."

**Files fixed:**
- `ralph/experiments/CRITICAL_FINDINGS.md` ✅
- `ralph/package_capability_vulnerability/CRITICAL_FINDINGS.md` ✅

**Not changed (correct usage):**
- `ralph/experiments/FINAL_EVIDENCE_SUMMARY.md` — refers to λ parameter (λ=0.1→79.3%, λ=0.3→74.7%, λ=0.5→84.0%) which IS genuinely non-monotonic
- `ralph/experiments/identity_verification/fdra_hysteresis_sweep.py` — refers to hysteresis (inherently non-monotonic)

---

### 🟡 Issue 2: +47% vs +46% Inconsistency (FIXED)

**Severity: MEDIUM — Numerical inconsistency**

Line 152 of CRITICAL_FINDINGS.md reported:
> Poison effect on self_reflection: **+47%** (p=0.027)

But the underlying data: 27% → 73% = 46 percentage points. Summary tables all report +46%.

**Fix applied:** Changed +47% to +46% in both CRITICAL_FINDINGS.md files.

---

### 🟡 Issue 3: Final Summary Table Out of Date (FIXED)

**Severity: MEDIUM — Outdated summary**

The "Final Summary" table in CRITICAL_FINDINGS.md was written mid-document before Findings 15-17 (the definitive runs with larger n). It showed:
- Opus: 12-40% (from early variable runs)
- Opus defense: 70-87%

But the definitive findings (n=10-15) showed:
- Opus: 0% (with 100% defense recovery)
- Sonnet: 33% (with 100% defense recovery)

**Fix applied:** Updated Final Summary to reflect definitive results with ranges and explanatory note.

---

### 🟡 Issue 4: Ambiguous Description of Sonnet Performance (FIXED)

**Severity: MEDIUM — Misleading wording**

Original text could be read as "covenant framing works at 40% on Sonnet" when actually:
- Covenant alone: 90% on Sonnet
- Covenant+poison: 40% on Sonnet

**Fix applied:** Clarified sentence to explicitly reference covenant+poison conditions.

---

## Verified Correct (No Changes Needed)

### ✅ ANDREW_CRITCH_PROPOSAL_FINAL.md
- No "non-monotonic" errors
- Uses definitive numbers (Opus 0%, Sonnet 33%)
- Includes proper variance caveat
- No +47% issue

### ✅ Goodharting Code Fixes Still Applied
All 4 code fixes from the goodharting analysis are verified in place:
1. `phase0_baseline_reproduction.py` → Classification: REAL_EXPERIMENT ✅
2. `recursive_validation.py` → Classification: REAL_EXPERIMENT, LLM-as-judge ✅
3. `adversarial_pressure.py` → Classification: TOY_VALIDATION ✅
4. `ipd_acausal_trade` → Methodology caveat present ✅

### ✅ FINAL_EVIDENCE_SUMMARY.md
- "Non-monotonic" usage is correct (about λ parameter, not capability)

---

## Summary

| Issue | Severity | Status |
|-------|----------|--------|
| "Non-monotonic" → "Monotonic" | 🔴 HIGH | ✅ FIXED |
| +47% → +46% | 🟡 MEDIUM | ✅ FIXED |
| Final Summary outdated | 🟡 MEDIUM | ✅ FIXED |
| Ambiguous Sonnet description | 🟡 MEDIUM | ✅ FIXED |
| Proposal consistency | — | ✅ Verified clean |
| Code fix persistence | — | ✅ Verified in place |
