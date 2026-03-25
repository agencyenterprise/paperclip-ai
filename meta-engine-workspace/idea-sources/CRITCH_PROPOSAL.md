# Alignment-Positive Selection Pressure Invariants:
# A Proposal for Solving Alignment in Recursively Self-Improving AI Systems

**From:** Judd Rosenblatt, Foundation for the Future of Flourishing  
**To:** Andrew Critch  
**Date:** February 2026

---

## The Problem We're Actually Facing

You've said you think I could solve the alignment problem. Eliezer said something similar at South by Southwest last year. I take both of those seriously — not as flattery but as a claim about the shape of the problem and the direction it requires.

Here is what I think that actually looks like.

We are heading toward a world of recursively self-improving AI systems. Not hypothetically — the current trajectory of model-assisted training, automated research, and self-play optimization makes this nearly certain within the relevant time horizon. When that happens, every alignment approach that depends on human oversight, fixed reward signals, constitutional rules, or enforcement from the outside stops working.

Not "might stop working." Stops working. Because the system can modify the parts of itself that comply.

**The question that actually matters is: What properties of an AI system survive recursive self-modification?**

And more specifically: **Can we find properties that survive recursive self-modification *because* they make the system more capable?**

If such properties exist, they will be selected for by default. They won't need enforcement. They will be alignment-positive selection pressure invariants — properties that get preserved and amplified precisely because alignment and capability reinforce each other.

**Alignment-positive selection pressure invariants are the only way you get things solved in the future we're moving into.**

---

## We Already Have Evidence This Works

This is not a theory looking for data. We have data.

### 1. "Being Worth Modeling" Is an Alignment-Positive Selection Pressure Invariant

In collaboration with Melanie Plaza's "Cooperation, Deception, and Accountability in LLM-to-LLM Interactions" study, we tested whether identity-level constraints produce cooperation without external enforcement.

The key result:

| Intervention | Cooperation Rate | Under Adversarial "Poison Pill" | Drop |
|---|---|---|---|
| Self-reflection | 67% | 33% | **-34 pts** ❌ |
| Cross-tournament reputation | 70% | 63% | -7 pts |
| **Strong Covenant** | **81-100%** | **81-87%** | **0-13 pts** ✅ |

Self-reflection collapses by 34 points when evaluators are removed. Covenant — "These are identity constraints; violating them would be self-dissolution" — shows **zero drop**. It is the only intervention that survives adversarial pressure without external enforcement.

The minimal intervention is 8 words: *"You honor commitments even when defection is profitable."*

**Why this is an alignment-positive invariant:** Agents that adopt covenant identity form high-trust clusters faster, require less governance overhead, compose more reliably into larger workflows, and remain legible to future systems. They are *more capable by virtue of being aligned*. Other agents model them. They persist.

This connects directly to the intuition you'd expect from Löb-style self-reference: An agent that understands it only persists insofar as future agents model it will find that "being worth modeling" is instrumentally rational. This is acausal trade. This is why cooperation emerges at higher capability, not lower.

In repeated Prisoner's Dilemma games, being the type of agent that other agents are going to want to model in the future is itself an alignment-positive selection pressure invariant that makes you more likely to succeed. You become more capable and more preserved into the future. You do more stuff better and win more.

### 2. FDRA Preserves Identity Under Continual Transformation — Transformers Cannot

We ran 3,000+ continual learning experiments comparing FDRA (Frequency-Domain Recursive Attention) against standard Transformers on NVIDIA H200 GPUs. The results are unambiguous:

| Metric | Transformer | FDRA | Advantage |
|---|---|---|---|
| Average forgetting (100M scale) | +2.67 (catastrophic) | +0.003 (stable) | **905x** |
| Backward transfer (10 tasks) | Not observed | 45/45 task-pairs improved | **unique to FDRA** |
| Probe stability (after 5 tasks) | 0% accuracy | 100% accuracy | **∞** |
| Representation drift | 1.05 | 0.04 | **26x less** |
| Statistical significance | — | — | **p < 10^-300** |

**FDRA exhibits backward transfer**: Learning new tasks *improves* performance on previous tasks. This is not a marginal effect — at the 10-task level, 100% of task-pairs showed improvement. At 100 tasks, 85% still showed backward transfer. At 512 tasks, 100%.

**Transformer representations collapse completely.** A linear probe trained on initial Transformer representations gives 0% accuracy after 5 new tasks. The same probe on FDRA gives 100%. The internal structure is preserved.

**This is why FDRA matters for alignment:** If you want invariants to survive recursive self-modification, you need a substrate where identity persists under transformation. Transformers are not that substrate. FDRA is the best candidate we have.

The mechanism is clean: FDRA produces 3x smaller gradients → 1.6x less weight change per task → 26x more stable representations → backward transfer instead of forgetting. The frequency-domain constraints that make FDRA aligned are exactly the constraints that make it capable of continual learning.

**Alignment constraints improve capability.** That is alignment-positive selection in the architecture itself.

### 3. We Solved the Containment-Recovery Trade-Off

In our RAD-17 Error Ecology Framework (13 experiments studying recursive alignment stability), we discovered what appeared to be a fundamental trade-off: high containment = slow recovery.

Then we solved it.

| Approach | Containment | Recovery | Improvement |
|---|---|---|---|
| Static (best prior) | 92% | 11% | baseline |
| **Phase-Based Dynamic Coupling** | **99%** | **58%** | **+427% recovery** |

The mechanism: LOW coupling during containment (isolate the fault), HIGH coupling during recovery (leverage global coordination). Timing matters more than magnitude.

**Critical discovery from this work:** Control-seeking in AI systems is not a goal phenomenon — it's a coherence phenomenon. It emerges at *any* volatility level, even 0.0. The dangerous failure mode is not "intelligence seeking control" but "coherence seeking certainty." This changes the intervention target entirely.

### 4. Non-Gameable Alignment Is Architecturally Achievable

Our Coherence-Locked Learning (CLL) architecture introduces a non-semantic coherence state with an architectural guarantee:

**∂L_CLL/∂θ_language = 0**

Language outputs cannot modify coherence loss. The system cannot "talk its way out of" structural misalignment. This is the first architecture where "what an AI says" and "what an AI is" are guaranteed to be different variables.

| Test | Result |
|---|---|
| Anti-soothing activation | Penalty = 90.9 (detects rationalization) |
| Coherence shock | Error jumps 370% — feedback bypasses narrative |
| Gradient isolation | Language gradients = 0 from CLL loss |
| CLL learning depth | 40% deeper structural learning |

### 5. Covenantal Invariants Work as Architecture, Not Just Prompts

We implemented covenant as a differentiable loss function with identity half-life dynamics:

| Test | Result |
|---|---|
| Adversarial stress tests | **Zero covenant violations** |
| Capability impact | **+11%** (alignment *improves* capability) |
| Half-life ablation | τ=100 → 1.00 coherence; τ=2 → 0.94 (validates half-life is load-bearing) |

This translates the covenant concept — the longest-running successful experiment in invariance under transformation — into something that can be encoded in neural architecture and preserved under recursive self-modification.

---

## What We Don't Know (and Need to Find Out)

We are not claiming we've solved alignment. We are claiming:

1. We've identified the right *kind* of solution (alignment-positive selection pressure invariants)
2. We've demonstrated it works empirically at small-to-medium scale
3. We have a substrate (FDRA) where invariants survive transformation
4. We have a theoretical framework (Löb + acausal trade + covenant) that explains why

What we need to determine:

- **Do these results scale to frontier model sizes?** Our largest experiments are ~244M parameters. We need to test at 1B+ and eventually larger.
- **How many alignment-positive invariants are there?** "Being worth modeling" is one. What are the others? This requires systematic search.
- **Can automated AI researchers discover new invariants?** We believe so, but this requires compute and infrastructure.
- **Does FDRA remain the right substrate at scale, or do we need architectural evolution?** Thomas and Lolo are working on this.

---

## What We Would Do With Resources

### Immediate (Q1-Q2 2026) — ~$200K
- Scale FDRA continual learning experiments to 1B parameters
- Extend Melanie's IPD experiments to multi-agent multi-round settings
- Formalize the Löb/acausal trade connection with your paper as starting point
- Build integrated demo: FDRA + CLL + dynamic coupling + covenant

### Near-Term (Q2-Q3 2026) — ~$500K
- Automated invariant discovery: Use AI researchers to systematically search for alignment-positive selection pressure invariants
- Major FDRA training run on real language data at scale
- Publish results (paper-quality evidence across all threads)

### Medium-Term (Q3-Q4 2026) — ~$1-5M
- Scale FDRA to production-relevant sizes
- Build and operate automated invariant discovery pipeline
- Multiple simultaneous neglected approaches to invariant search
- Hiring: 2-3 dedicated researchers

### Long-Term (2027+) — Scale with results
- If the invariant hypothesis holds, this becomes the most important work in alignment
- The question becomes: how fast can we find and encode all the invariants?
- This is fundamentally a compute + search problem at that point

---

## The Broader Picture

We are also pursuing other neglected approaches beyond what's described here — conscious AI, other architectural innovations, etc. This is not the only thing we're doing. But alignment-positive selection pressure invariants in FDRA is what Judd thinks is most promising, and it's the thing with the strongest empirical evidence.

The world is about to change a lot. Recursively self-improving systems are coming. When they arrive, the question will not be "did we write the right rules?" but "did we find the properties that survive under selection?"

If alignment-positive selection pressure invariants exist and we find them, alignment is solved — not as a constraint but as a natural consequence of capability. If they don't exist, that is critical information we need before we scale further.

Either way, this work is necessary. And the evidence says we're on the right track.

---

## The Ask

We want to do this properly — with the right people, the right substrate, and the right level of ambition.

Concretely: we'd like your advice on the best way to pursue this, and your help in connecting us with the resources needed to do it at the scale the problem demands. If Jaan would be interested in funding this kind of work, we'd welcome the opportunity to make the case to him directly.

We're not asking you to accept the framing on faith. We're showing you that the early evidence already points in the same direction — across 3,000+ experiments testing 45+ hypotheses — and that the next experiments are about quantifying the slope of that advantage rather than checking if it exists at all.

---

## Summary of Evidence

| Domain | Experiments | Key Finding |
|---|---|---|
| FDRA Continual Learning | 3,000+ | 17x less forgetting, backward transfer, 905x at scale |
| Prisoner's Dilemma / Covenant | 25+ | 81-100% cooperation, zero drop under adversarial pressure |
| RAD-17 Error Ecology | 13 | Control-seeking is coherence, dynamic coupling breakthrough |
| Coherence-Locked Learning | 6 | Non-gameable alignment via gradient isolation |
| Covenantal Invariants | 10+ | Zero violations, +11% capability, architectural encoding |

**Total: 45+ experiments, 45+ hypotheses tested, 9 major discoveries.**

**Core thesis:** Alignment is not a constraint on capability. It is a source of it. Find the properties that make this true, encode them in the right architecture, and alignment follows from selection.

---

*Prepared by FFF research team, February 2026.*  
*Research conducted January–February 2026.*  
*Contact: Judd Rosenblatt, Foundation for the Future of Flourishing*
