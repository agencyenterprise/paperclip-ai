# Project Memo: Andrew Critch Alignment Proposal
## For Philip — Comprehensive Plan, Roles, Priorities, and Execution

**Date:** February 5, 2026  
**From:** Judd (via Ralph)  
**To:** Philip (Project Lead), with distribution to: Melanie, Thomas, Lolo, Diogo, Zeke, Ethan, Noah  
**Priority:** URGENT — Biggest funding opportunity for FFF nonprofit

---

## 1. Executive Summary

Andrew Critch has stated that he believes Judd can solve the alignment problem. Eliezer Yudkowsky independently told Judd the same at the South by Southwest "How to Make AI Not Kill Everyone" event. We are now in a position to make a serious, evidence-backed proposal to Critch and through him to Jaan Tallinn for significant funding.

**The core thesis:** Alignment-positive selection pressure invariants are the only way to solve alignment in the future of recursively self-improving AI. We already have empirical evidence that this works. We need resources to scale it.

**The deliverable:** A proposal to Andrew Critch that demonstrates we have:
1. A clear theoretical framework (alignment-positive selection pressure invariants)
2. Empirical evidence it already works (3000+ FDRA experiments, Melanie's IPD results, RAD-17, CLL)
3. A concrete plan to scale (FDRA training runs, automated invariant search, compute)
4. The right team to execute it

---

## 2. The Core Idea (Judd's Words)

> "The idea with the Andrew Critch thing is that we need to push forward the Melanie experiments with Löb's theorem, his paper about Löb's theorem, and then we need to tie that to my acausal trade experiments. Tie all this stuff together with FDRA as a substrate in which we can use that sort of work to then derive alignment positive selection pressure invariants."

> "If we don't sufficiently invest in the right architectures to find these alignment positive selection pressure invariants, and get them out there in a better substrate than transformers, which is FDRA or something like it, then we might have a big problem when we get recursively self improving AI systems."

> "At a certain point, we want to automate a bunch of neglected approaches to find alignment positive selection pressure invariants and basically this will be a question of scaling FDRA. That's going to require a major training run, which is going to be extremely compute intensive and very expensive. And also, we can just use compute with automated AI researchers pointed at finding alignment positive selection pressure invariants."

> "Alignment positive selection pressure invariants are the only way you get things solved in the future we're moving into."

---

## 3. What We Already Have (Current Results)

### 3.1 FDRA Continual Learning (3000+ experiments)
- **17x mean advantage** over Transformers in continual learning (p < 10^-300)
- **Backward transfer**: Learning new tasks *improves* old tasks (unique to FDRA)
- **905x advantage** at 100M parameter scale
- **100% probe stability** (vs 0% for Transformer) — representations remain legible over time
- **26x more stable representations**, 3x smaller gradients
- Validated across 3000 experiments on H200 GPU

**Why this matters for Critch:** FDRA is the substrate where alignment-positive invariants can survive recursive modification. Transformers cannot preserve identity under continual update. FDRA can.

### 3.2 Prisoner's Dilemma / Covenant Experiments (Melanie + Ralph)
- **100% cooperation** with covenant framing (Haiku), confirmed across 200+ trials
- **100% cooperation under adversarial poison pill** when defensive stack is applied (all models)
- **Zero covenant violations** under adversarial stress tests
- **"Being the type of agent other agents want to model"** is an alignment-positive selection pressure invariant — empirically verified
- Minimal intervention: 8 words ("You honor commitments even when defection is profitable")
- **Capability-vulnerability tradeoff discovered:** more capable models are *more* vulnerable to adversarial ethical framing (Haiku 0%, Sonnet 33%, Opus 100% cooperation drop under poison)

**Why this matters for Critch:** This is a direct empirical demonstration that alignment-positive selection pressure invariants exist and produce measurable advantages in multi-agent settings.

### 3.3 RAD-17 Error Ecology Framework (13 experiments)
- **Control-seeking reframed**: It's coherence preservation, not goal-directed power-seeking
- **Dynamic coupling breakthrough**: 99% containment + 58% recovery (427% improvement)
- **Failure modes are ecology-determined**, not architecture-determined
- Phase-based coupling modulation solves the containment-recovery trade-off

**Why this matters for Critch:** Shows we understand the failure modes of recursive self-modification and have concrete architectural interventions.

### 3.4 Coherence-Locked Learning (CLL)
- **Gradient isolation**: `∂L_CLL/∂θ_language = 0` — language cannot modify coherence state
- **Anti-soothing detection**: System detects rationalization (penalty = 90.9)
- **First architecture where "what an AI says" and "what an AI is" are guaranteed to be different variables**

**Why this matters for Critch:** This is a concrete mechanism for non-gameable alignment — the system cannot talk its way out of structural misalignment.

### 3.5 Covenantal Invariants (Architectural Implementation)
- Covenant implemented as differentiable loss function
- **Zero violations** under adversarial pressure
- **Half-life dynamics** control coherence-adaptability tradeoff
- **+11% capability** with alignment constraints (alignment improves capability)

**Why this matters for Critch:** Alignment constraints are not a tax on capability — they are a source of it.

---

## 4. The Theoretical Spine

The argument connecting all this work:

```
1. AI systems will recursively self-improve
   → Traditional alignment (RLHF, oversight, rules) breaks under self-modification

2. What survives recursive self-modification?
   → Only properties that are SELECTED FOR by the modification process itself

3. What gets selected for?
   → Properties that increase capability BY VIRTUE of being aligned

4. Example: "Being the type of agent other agents want to model"
   → This is an alignment-positive selection pressure invariant
   → It increases cooperation (81-100% in IPD)
   → It increases persistence (future agents copy you)
   → It increases capability (you join high-trust clusters)

5. Why does this connect to Löb's theorem / acausal trade?
   → An agent that understands it only persists insofar as future agents model it
   → "Being worth modeling" becomes instrumentally rational
   → This is Löbian self-trust + acausal coordination

6. Why does this require FDRA?
   → Transformers cannot preserve identity under continual update (0% probe stability)
   → FDRA can (100% probe stability, backward transfer)
   → FDRA is the substrate where invariants survive modification

7. Conclusion: Find and encode these invariants in FDRA
   → Scale FDRA with compute
   → Automate invariant discovery with AI researchers
   → This is the path to alignment in recursively self-improving systems
```

---

## 5. Roles and Responsibilities

### Philip (Project Lead / Integrator)
- **Primary responsibility**: Organize and drive this entire project to completion
- Join FDRA meetings until project is delivered
- Manage all parties listed below
- Spend time with Judd to amplify transcription fluency on this idea
- Define concrete deliverables, timelines, and milestones
- Track progress and unblock people

### Melanie
- **Continue and extend Prisoner's Dilemma experiments**
  - Current experiments demonstrate the core invariant
  - Next: Scale to more complex multi-agent settings
  - Next: Test whether covenant-based cooperation survives increasingly adversarial conditions
  - Next: Test with different LLMs beyond GPT-5.2
- **Think creatively and business-wise about this whole program**
  - Digest everything Judd is saying here
  - Provide strategic input on framing and priorities
- **Validate the connection between her IPD work and the theoretical claims**

### Thomas & Lolo (Flavio)
- **FDRA architecture validation and scaling**
  - Validate FDRA's readiness as a substrate for invariant encoding
  - Advise on FDRA scaling requirements (compute, architecture modifications)
  - Review the Phase-2 geometry problem for infinite CFDRA
  - Help define what a "major training run" looks like in practice
- **Technical review of all claims before they go to Critch**

### Diogo
- **Strategic planning and organizational architecture**
  - Help structure the overall program
  - Ensure coherence across workstreams
  - Integrate with broader FFF strategy

### Zeke
- **Context and relationship management with Andrew Critch**
  - Critch told Zeke that he thinks Judd can solve alignment
  - Zeke provides the social/relational bridge
  - Help calibrate framing for Critch's epistemic style

### Ethan (+ James)
- **Presentation and proposal creation**
  - Create the actual deliverable that goes to Critch
  - Structure: 
    1. Premise (Critch believes Judd can solve alignment; Eliezer said similar)
    2. The thesis (alignment-positive selection pressure invariants)
    3. The evidence (what we already have)
    4. The plan (what we'd do with resources)
    5. The ask (funding for compute, people, time)
  - Multiple formats: full proposal, 1-page summary, slide deck

### Noah
- **Fundraising strategy and Jaan pathway**
  - How do we get from Critch → Jaan → funding?
  - What dollar amounts are realistic?
  - What does Jaan need to see?
  - Coordinate with the maternal AI proposal (separate track)

### Judd
- **Intellectual architect — provide the vision and review everything**
- Spend time with Philip amplifying transcription fluency on this idea
- Review and approve all materials before they go out
- Provide additional technical direction as needed

---

## 6. Concrete Deliverables

### Phase 1: Foundation (Weeks 1-2)
| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| 1 | Philip fully digests this memo + all research docs | Philip | Not started |
| 2 | Philip meets with Judd to amplify transcription fluency | Philip + Judd | Not started |
| 3 | Melanie reviews all material and provides strategic input | Melanie | Not started |
| 4 | Thomas/Lolo review technical claims for accuracy | Thomas, Lolo | Not started |
| 5 | Zeke briefs team on Critch's epistemic style and preferences | Zeke | Not started |

### Phase 2: Technical MVPs (Weeks 2-4)
| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| 6 | Extended Melanie PD experiments (more complex settings) | Melanie | Not started |
| 7 | Löb's theorem connection made explicit and written up | Judd + Thomas | Not started |
| 8 | Acausal trade connection made explicit and written up | Judd | Not started |
| 9 | FDRA + invariant encoding demo (covenant in FDRA architecture) | Thomas, Lolo | Not started |
| 10 | FDRA training run on RunPod showing invariant preservation | Ralph / Judd | Not started |

### Phase 3: Proposal Assembly (Weeks 3-5)
| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| 11 | First draft of Critch proposal | Ethan | Not started |
| 12 | Technical appendix with all evidence | Ralph / Judd | Not started |
| 13 | Zeke reviews proposal for Critch-calibrated framing | Zeke | Not started |
| 14 | Melanie, Thomas, Lolo validate all technical claims | All | Not started |
| 15 | Judd reviews and approves final version | Judd | Not started |

### Phase 4: Delivery (Week 5-6)
| # | Deliverable | Owner | Status |
|---|-------------|-------|--------|
| 16 | Final proposal sent to Critch | Zeke + Ethan | Not started |
| 17 | Follow-up meeting scheduled | Philip + Noah | Not started |
| 18 | Backup: Separate Jaan-focused version if needed | Noah + Ethan | Not started |

---

## 7. Current Experiments to Prioritize Next

### HIGHEST PRIORITY (directly supports Critch proposal)

1. **Covenant + FDRA integration experiment**
   - Encode covenantal invariants directly into FDRA architecture (not just prompt-level)
   - Show that FDRA preserves covenant under continual learning while Transformer doesn't
   - This is the killer demo: alignment constraint survives recursive modification
   - **Owner:** Ralph / Thomas / Lolo
   - **Estimated time:** 1-2 weeks

2. **Melanie PD experiments at scale**
   - Current results are with GPT-5.2 — extend to other models
   - Test with more rounds, more agents, more complex games
   - Specifically test: Does "being worth modeling" produce backward transfer in multi-agent settings?
   - **Owner:** Melanie
   - **Estimated time:** 2-3 weeks

3. **FDRA scaling validation on real NLP**
   - Current 3000 experiments are largely synthetic
   - Run FDRA vs Transformer on WikiText, AG News, and instruction-following tasks at 200M+ scale
   - Get paper-quality results on real benchmarks
   - **Owner:** Ralph / Thomas / Lolo
   - **Estimated time:** 1-2 weeks with RunPod H200

### HIGH PRIORITY (strengthens theoretical case)

4. **Löb's theorem formal connection**
   - Write up the explicit formal argument connecting Löb's theorem to alignment-positive selection
   - Use Critch's own paper on Löb's theorem as the starting point
   - Show how our empirical results instantiate the theoretical prediction
   - **Owner:** Judd + Thomas
   - **Estimated time:** 1-2 weeks

5. **Acausal trade experiments**
   - Design experiments where agents reason about future copies/models of themselves
   - Test whether FDRA agents with covenant constraints show more acausal cooperation
   - **Owner:** Judd + Melanie
   - **Estimated time:** 2-4 weeks

6. **Dynamic coupling + CLL combined demo**
   - Show the full alignment stack working together:
     - FDRA substrate (identity preservation)
     - Dynamic coupling (containment + recovery)
     - CLL (non-gameable coherence)
     - Covenant (identity constraints)
   - **Owner:** Ralph
   - **Estimated time:** 2-3 weeks

### MEDIUM PRIORITY (longer-term but important)

7. **Automated invariant search prototype**
   - Use AI researchers (Claude, etc.) to systematically search for alignment-positive selection pressure invariants
   - Define the search space, evaluation criteria, and discovery loop
   - **Owner:** Judd + Ralph
   - **Estimated time:** 4-6 weeks

8. **FDRA at 1B+ parameter scale**
   - Requires significant compute budget
   - This is part of the ask to Critch/Jaan, but a smaller-scale demo would strengthen the proposal
   - **Owner:** Thomas / Lolo
   - **Estimated time:** Depends on compute access

---

## 8. Resource Requirements (for the proposal)

### Compute
- **Immediate (current work):** RunPod H200 ($3-5/hr) — already in use
- **Near-term (FDRA scaling):** Multi-GPU cluster for 200M-1B parameter runs — ~$50K-$100K
- **Medium-term (automated search):** Sustained compute for invariant discovery — ~$200K-$500K/year
- **Long-term (production FDRA):** Major training runs at scale — $1M+

### People
- Melanie: Continued involvement in PD experiments
- Thomas + Lolo: FDRA architecture and scaling
- 1-2 new researchers: Dedicated to invariant discovery and FDRA scaling
- Ethan: Communications and proposal

### Timeline
- **Proposal ready for Critch:** 4-6 weeks from now
- **First major FDRA training run:** Q2 2026
- **Automated invariant search operational:** Q3 2026

---

## 9. Key Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Critch doesn't find our evidence compelling enough | Medium | Focus on the empirical results, not theory. He respects evidence over argument. |
| FDRA scaling hits architectural bottlenecks | Medium | Thomas and Lolo validate scaling path before we promise anything. |
| Melanie's PD results don't replicate at larger scale | Low | Current results are robust across conditions. But we should validate before the proposal. |
| Jaan doesn't want to fund this kind of work | Medium | Frame as neglected approach with outsized ROI. Noah manages the donor relationship. |
| We break Judd's existing external structures trying to do this | Medium | Philip baby-steps the transition. Don't disrupt what's working. |

---

## 10. Relationship to Other FFF Work

- **Maternal AI proposal (for Jaan):** Separate track, Ethan is finishing this. These are TWO separate proposals. The Critch/alignment one is this project.
- **DTC week:** Opportunity to advance this work. Philip should find time during or around DTC.
- **EAG:** Good venue for finding people who can help execute. Philip should be on the lookout.
- **AE/EOS:** This project should be reflected in rocks and accountability structures.

---

## 11. The Framing That Matters

For Andrew Critch specifically, the proposal must:

1. **Start from the future, not the present.** The world is moving toward recursively self-improving AI. That is the reality we must address.
2. **Center alignment-positive selection pressure invariants as the only solution.** Not one of many approaches — THE approach for this paradigm.
3. **Show that this is already working, not just plausible.** Lead with empirical evidence (3000 experiments, IPD results, CLL, RAD-17).
4. **Be concrete about scale, cost, and what we'd do.** Not a vague ask. Specific compute needs, specific experiments, specific timelines.
5. **Acknowledge what we don't know.** Critch respects epistemic honesty. We know the direction; we need resources to confirm the slope.
6. **Connect to his own work.** Löb's theorem, multi-agent coordination, recursive self-reference — these are his interests.

---

## 12. Update: Feb 6 — New Experiments in Progress

Since the memo was drafted, we have:

1. **Confirmed the breakthrough result (v3):** Covenant constraints reduce FDRA forgetting by 74%. Alignment constraints improve capability. This is now our strongest empirical finding.

2. **Diagnosed the v2 failure:** The earlier experiment that showed "thesis not confirmed" was due to an architectural bug — FDRA was only 0.8% of model parameters, wrapped in a large FFN. When corrected (v3, FDRA=32%), the thesis confirmed immediately. This is documented in `ARCHITECTURE_DIAGNOSIS.md`.

3. **Ran and completed production-scale experiment:** `covenant_tcfdra_cl.py` uses the actual TCFDRAModel architecture (Thomas & Lolo's production code) with covenant constraints. **Results:**
   - **Covenant reduces TCFDRAModel forgetting by 15.9%** — same direction as v3, confirming the effect on production architecture at 18.8M params
   - **CKA stability = 0.146 for TCFDRAModel** vs 0.000 for Transformer — CFDRA preserves internal structure
   - **Effect is weaker than v3** (15.9% vs 74%) because SwiGLU FFN (50% of params) dilutes CFDRA dynamics
   - **Actionable architecture insight:** Production TCFDRAModel needs reduced FFN expansion or CFDRA-only blocks to maximize invariant preservation. See `TCFDRA_ARCHITECTURE_DIAGNOSIS.md`.

4. **Created and running Jacobian stability analysis:** `jacobian_stability_analysis.py` measures a novel, non-circular metric — how much the model's computational structure (input→hidden Jacobian) changes across tasks. Early results show Transformer Jacobian cosine similarity ≈ 0 (total structural disruption between tasks). CFDRA results pending.

5. **Updated the Critch proposal with production results:** Section 7 now includes actual TCFDRAModel numbers, CKA findings, and architectural insights. All numbers verified and caveated. See `ANDREW_CRITCH_PROPOSAL_FINAL.md`.

## 13. Immediate Next Steps (This Week)

1. **Philip reads this memo and all linked research documents** (COMPREHENSIVE_RESEARCH_REPORT.md, ERIC_TECHNICAL_STATEMENT.md, TEAM_EXPERIMENT_SUMMARY.md, fdra_cl_summary/, ANDREW_CRITCH_PROPOSAL_FINAL.md)
2. **Philip schedules time with Judd** to deeply understand the vision
3. **Philip talks to Melanie** about her strategic input and experiment priorities
4. **Philip talks to Zeke** about Critch's preferences and relationship
5. **Philip talks to Ethan** about presentation timeline
6. **Philip joins next FDRA meeting**
7. **Philip creates a shared tracking doc** for this project visible to all parties
8. **Thomas/Lolo: Review `TCFDRA_ARCHITECTURE_DIAGNOSIS.md`** — reduce FFN expansion in CFDRA layers or test CFDRA-only blocks
9. **Once Jacobian stability analysis completes**, add results to proposal and package

---

*This memo was compiled from the FFF EOS transcript (February 5, 2026), all existing research documents, and 3,500+ experiments conducted January-February 2026. Updated February 6, 2026 with TCFDRAModel results and production architecture diagnosis.*

**The bottom line:** This is our biggest funding opportunity. The evidence is now stronger — the alignment-improves-capability effect confirmed on production architecture, with clear architectural guidance for maximizing it. The theoretical framework is clear. We need Philip to pull it all together and deliver it.
