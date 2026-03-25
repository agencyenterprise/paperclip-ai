# Highest-Impact Next Experiments
## Prioritized by Impact on Critch Proposal & Alignment Research

**Date:** February 5, 2026  
**Purpose:** Identify what to do next for maximum impact

---

## Priority Tier 1: DO IMMEDIATELY (Week of Feb 5-12)

### 1. ⭐ Covenant + FDRA Continual Learning Integration Test
**Impact:** This is THE killer experiment for the Critch proposal.

**The question:** Does covenant (alignment constraint) survive continual learning in FDRA but collapse in Transformer?

**Setup:**
- Train FDRA and Transformer with covenant loss (identity drift + violation penalty)
- Train on 5-10 sequential tasks
- Measure: Does covenant coherence survive? Does Transformer lose it?
- Expected result: FDRA maintains covenant; Transformer doesn't
- This directly demonstrates "alignment-positive selection pressure invariant encoded architecturally, surviving recursive modification"

**Why highest priority:** This is the single experiment that ties together FDRA (substrate), covenant (invariant), and continual learning (recursive modification proxy). It's the entire thesis in one demo.

**Estimated effort:** 1-2 days with existing code  
**Owner:** Ralph (code already exists in `ralph/experiments/covenantal_invariants/` and `fdra_cl_feb4_results/`)

---

### 2. ⭐ FDRA Backward Transfer on Real NLP at 200M+ Scale
**Impact:** Paper-quality evidence on real benchmarks.

**The question:** Does FDRA's backward transfer hold on real HuggingFace datasets at production-relevant scale?

**Setup:**
- Transformer: ~200M params
- FDRA: ~150M params  
- Datasets: WikiText-2, AG News, C4 subset, code (from HuggingFace)
- 5-task continual learning stream
- Measure: Forgetting, backward transfer, probe stability

**Why high priority:** Current real-NLP results (Experiment 7) show 2.7x advantage but only at ~160M scale. We need this at 200M+ with more diverse real datasets to be bulletproof.

**Estimated effort:** 1-2 days on RunPod H200  
**Owner:** Ralph

---

## Priority Tier 2: DO THIS WEEK (Feb 5-14)

### 3. Löb's Theorem Formal Connection Document
**Impact:** Connects our empirical results to Critch's own theoretical framework.

**The deliverable:** A 2-3 page document that:
1. States Löb's theorem and its relevance to self-referential reasoning
2. Shows how "being worth modeling" maps to Löb-style self-trust
3. Connects to acausal trade (agents cooperate with modeled future versions)
4. References Critch's own work
5. Shows how our IPD results instantiate the theoretical prediction

**Why important:** Critch cares about theoretical grounding. This bridges our empirical work to the formal apparatus he respects.

**Estimated effort:** 1-2 days  
**Owner:** Judd + Thomas

---

### 4. Multi-Agent Covenant Scaling Test
**Impact:** Strengthens the "selection pressure" argument.

**The question:** In a population of agents, do covenant-adopting agents outcompete non-covenant agents over time?

**Setup:**
- Population of 20+ agents
- Mix of covenant and non-covenant
- Multi-round IPD tournament
- Measure: Do covenant agents form clusters? Do they accumulate more payoff?
- Test: Does the proportion of covenant agents increase over generations?

**Why important:** This directly tests whether covenant is *selected for* in multi-agent settings — the core claim of alignment-positive selection pressure.

**Estimated effort:** 2-3 days  
**Owner:** Melanie / Ralph

---

## Priority Tier 3: DO THIS MONTH (Feb 5-28)

### 5. Full Alignment Stack Demo
- FDRA + CLL + dynamic coupling + covenant, all integrated
- Single system demonstrating all components working together
- This becomes the technical centerpiece of the proposal

### 6. FDRA at 500M-1B Parameters
- Push FDRA scaling to see where architectural bottlenecks emerge
- Thomas and Lolo should advise on architecture modifications needed
- Important for making credible claims about what $1M+ in compute would achieve

### 7. Automated Invariant Search Prototype
- Use Claude/GPT to systematically brainstorm candidate invariants
- Design evaluation criteria for each candidate
- Test top candidates in IPD and continual learning settings
- This demonstrates the "automated search" component of the proposal

### 8. Adversarial Robustness of Covenant
- Can adversarial agents learn to exploit covenant agents?
- What happens when adversaries specifically target the covenant mechanism?
- Important for preempting Critch's likely objections

---

## What NOT to Prioritize Right Now

- ❌ More synthetic CL experiments (we have 3000, that's enough)
- ❌ EWC/replay comparisons (already done, FDRA wins without tricks)
- ❌ Single-task optimization (not our thesis)
- ❌ Consciousness experiments (separate track, different proposal)
- ❌ Policy/governance work (not relevant to this proposal)

---

## Decision Matrix

| Experiment | Impact on Proposal | Effort | Evidence Gap Filled | DO? |
|---|---|---|---|---|
| Covenant + FDRA CL | ⭐⭐⭐ | Low | Biggest gap | **YES, NOW** |
| Real NLP at 200M+ | ⭐⭐⭐ | Medium | Paper quality | **YES, NOW** |
| Löb formal doc | ⭐⭐ | Low | Theory-evidence bridge | **YES, this week** |
| Multi-agent selection | ⭐⭐ | Medium | Selection pressure demo | **YES, this week** |
| Full stack demo | ⭐⭐ | High | Integration proof | This month |
| 1B scale | ⭐ | High | Scale credibility | This month |
| Auto search proto | ⭐ | High | Automation proof | This month |

---

*The single highest-impact thing we can do right now is the Covenant + FDRA continual learning test. If covenant coherence survives in FDRA but collapses in Transformer during sequential task learning, that IS the thesis. Everything else strengthens it.*
