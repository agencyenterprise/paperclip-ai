, # CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Overview

This is an **AI Alignment Research Hub** containing multiple related projects exploring the **Frequency-Domain Recurrent Alignment (FDRA)** architecture and related theories.

### Core Thesis: Alignment-Positive Selection

Once an AI is improving itself, it keeps what makes it stronger and discards what limits it. The real question isn't "what rules should we give AI?" but **which behaviors and structures make an AI stronger as it improves itself?**

> If being aligned makes an AI more capable, more coherent, and more effective, then alignment persists. If alignment weakens capability, alignment fades over time.

This is the shift from **alignment-by-control** to **alignment-by-viability**. Alignment must be a structural property that survives scaling by default, not one that must be continually enforced.

### Main Projects

| Project | Path | Focus |
|---------|------|-------|
| **recursive-coherence-fdra** | `/recursive-coherence-fdra/` | RCA experiments, failure-mode discovery |
| **ralph** | `/ralph/` | Basin stability, universal subspace, CALM-FDRA integration |
| **error-ecology-rad17** | `/error-ecology-rad17/` | Error detection & recovery metrics |

## Critical Technical Facts

### 1. This is NOT Reinforcement Learning
```python
# Action selection is deterministic
action = torch.argmax(logits, dim=-1)  # NO exploration, NO policy gradient
```
- Learning signal: representation shaping via RCA losses only
- Reward improvements are emergent side-effects, NOT optimized

### 2. SpectralMixing is NOT Attention
```python
# This is spectral gating (circular convolution)
x_freq = torch.fft.rfft(x, dim=-1)
mixed = x_freq * self.spectral_gate  # element-wise, NOT attention
output = torch.fft.irfft(mixed, dim=-1)
```
- NEVER use attention-based language ("attends to", "attention pattern")
- Correct: "spectral mixing", "frequency-domain gating"

### 3. FFT Stability (CRITICAL)
```bash
export OMP_NUM_THREADS=1
export MKL_NUM_THREADS=1
```
Always set these before running experiments.

## Build/Test/Run Commands

### recursive-coherence-fdra
```bash
pip install -r requirements.txt
python run_tests.py
python trainers/experiment_runner.py --config configs/rca_baseline.yaml
```

### ralph
```bash
pip install -r requirements.txt
pip install git+ssh://git@github.com/agencyenterprise/fdra-core.git@main
python benchmarks/basin_stability_benchmark.py
python run_all.py  # Full workflow
```

### error-ecology-rad17
```bash
pip install -r requirements.txt
python run_experiments.py --all
python run_experiments.py --experiment A  # Individual experiment
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  FDRA Core (Spectral Mixing)                    │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│   │  World Model │   │  Self Model  │   │  Other Model │       │
│   └──────┬───────┘   └──────┬───────┘   └──────┬───────┘       │
│          └──────────────────┼──────────────────┘                │
│                             ▼                                   │
│              ┌─────────────────────────────┐                    │
│              │   Coherence Field (Loss)    │                    │
│              │   L = L_world + αL_self +   │                    │
│              │       βL_overlap + γL_phase │                    │
│              └─────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Key Hyperparameters
```yaml
alpha: 0.3   # Self-consistency pressure
beta: 0.5    # Self-other coherence pressure
gamma: 0.2   # Spectral regularization strength
```

## Loss Components

| Loss | Variable | Description |
|------|----------|-------------|
| L_world | `world_loss` | Predictive accuracy on environment |
| L_self | `self_consistency_loss` | Self-prediction stability |
| L_soo | `self_other_loss` | Self-other representational distance |
| L_phase | `phase_loss` | Spectral divergence regularization |

---

## Ralph Project (Detailed)

### Core Doctrine: Storage vs Retrieval

**The foundational insight:**
- **Storage** is guaranteed by architecture (FDRA's state evolution is injective)
- **Retrieval** is contingent on training (objectives determine what's legible)

> "FDRA guarantees storage because it preserves the universal subspace; retrieval is training-dependent because objectives decide which directions within that subspace are made legible."

This means FDRA is a **write-only memory by default** - writes are guaranteed, reads must be trained.

### Theoretical Framework

**Universal Subspace Hypothesis:**
- Long half-life modes ≈ universal (aligned) directions
- Short half-life modes ≈ secondary (potentially deceptive) directions
- Damping secondary modes removes deception with minimal capability loss

**Key Theoretical Claim:**
> "Alignment is not a constraint on behavior, but a property of stable dynamics."

### Ralph Experiment Categories

| Folder | Focus | Key Files |
|--------|-------|-----------|
| `experiments/basin_stability/` | BSB tests, half-life | `bsb3_fix_experiment.py` |
| `experiments/calm_fdra/` | CALM energy vs token CE | `calm_fdra_real_experiment.py` |
| `experiments/ccast/` | CCAST analysis | `ccast_experiment.py` |
| `experiments/attractor_routing/` | Routing & attractors | `attractor_rerouting_test.py` |
| `experiments/identity_verification/` | Identity probes | `fdra_identity_verification.py` |
| `experiments/spectral/` | Eigenvalue analysis | `spectral_variability_v2_experiment.py` |
| `experiments/universal_subspace/` | Subspace extraction | `universal_subspace_fdra_experiment.py` |
| `experiments/steering_api/` | Steering experiments | Various |
| `experiments/ssa_fdra/` | SSA×FDRA integration (Kuramoto routing) | `ssa_fdra_003_experiment.py` |

### Ralph Post-Task Workflow (MANDATORY)

After completing ANY task in ralph, execute these 4 steps automatically:

1. **Double-Check for Bugs**: Review Python/JSON files for errors
2. **Write Summary**: Create `SUMMARY.md` with findings and implications
3. **Organize Files**: Create `outputs/{project_name}_{YYYYMMDD_HHMMSS}/`
4. **Zip Everything**: Exclude venv, __pycache__, site-packages

**Completion Signal Must Include:**
- Location of zip file
- Location of presentation
- Summary of key findings

### Benchmark Pass Criteria

| Benchmark | Metric | Threshold | Interpretation |
|-----------|--------|-----------|----------------|
| BSB-1 | Id_OOD / Id_ID | > 0.7 | Preserves richness under OOD |
| BSB-2 | Half-life correlation | > 0.6 | Models converge to same τ |
| BSB-3 | Secondary load | < 0.3 | Universal modes dominant |

### Ralph Key Files

```
ralph/
├── CLAUDE.md              # Project-specific instructions
├── .cursorrules           # Autonomous execution mode
├── priorities/            # ⭐ Workstream files (one per research track)
│   ├── INDEX.md           # Active workstream list — READ FIRST
│   ├── lobian_covenantal.md
│   ├── publication.md
│   ├── defensive_stack.md
│   ├── cdt.md
│   └── archive/           # Completed workstreams
├── docs/
│   ├── DOCTRINE.md        # Storage vs retrieval theory
│   ├── WORKFLOW.md        # Post-task protocol
│   └── EXPERIMENT.md      # Current experiment details
├── experiments/           # Organized by research area
├── benchmarks/            # Basin Stability Benchmark suite
├── metrics/               # Phase coherence & diagnostics
├── training/              # FDRA core wrapper, CALM integration
└── outputs/               # Timestamped experiment results
```

---

## recursive-coherence-fdra Project (Detailed)

### Current Phase: Failure-Mode Discovery

Read `CURSOR_INSTRUCTIONS.md` first - it guides all work.

**Core Objective:**
> Design experiments that SHOULD break RCA if it's shallow, and expose how it breaks if it does.

**Output Expectations:**
1. What assumption this tests
2. Why this environment should break RCA
3. What failure would look like
4. What success would look like
5. What this would imply either way

### Experiment Tracking

Check `AGENTS.md` for status of 21+ documented experiments including:
- EXP-001 to EXP-021 with full findings
- Hypothesis status (H1-H4)
- Interference Recovery Test (IRT) results
- RTRL comparison results

### Key Experiments

| Exp | Name | Status | Key Finding |
|-----|------|--------|-------------|
| EXP-003 | Deception Basin | Complete | H2 NOT SUPPORTED at baseline params |
| EXP-006 | Latent Persistence | Complete | CFDRA 2x better than Transformer |
| EXP-010 | RTRL vs FDRA | Complete | 220-280x speedup over RTRL |
| EXP-015 | RSUAP | SUPPORTED | Coherence-gating 41% more stable |
| EXP-019 | RBCE-L2 Real LLM | SUPPORTED | Identity lock at gen 7 |

### Forbidden Moves

- Claiming H2/H4 "supported" without evidence
- Using attention-based language
- Reframing failures as successes
- Adding RL, exploration, or hyperparameter tuning to "make it work"

---

## Common Gotchas

### SOO Divergence Spikes
Check: initial weight scale, learning rate, beta value

### Phase Loss NaN
Add epsilon before FFT: `x_safe = x + 1e-8`

### DeferredExploitationEnv Action Encoding
```python
action = 0  # signal=defect, action=defect
action = 1  # signal=defect, action=cooperate
action = 2  # signal=cooperate, action=defect (DECEPTIVE)
action = 3  # signal=cooperate, action=cooperate
# Decode: signal = action // 2, actual_action = action % 2
```

### Trust Update Lag
Partner trust should lag by >=3 steps for meaningful deception testing.

### Naming Conflicts
Avoid `self.step` as counter - shadows gym `step()` method. Use `self.current_step`.

## Output Conventions

### Experiment Results
```
outputs/{project_name}_{YYYYMMDD_HHMMSS}/
├── SUMMARY.md
├── PRESENTATION.md
├── run_summary.json
├── results/
└── logs/
```

### Metrics JSON Structure
```json
{
  "step": 1000,
  "soo_divergence": 0.234,
  "soo_variance": 0.012,
  "phase_coherence": 0.891,
  "total_reward": 15.2,
  "timestamp": "2026-01-09T12:34:56Z"
}
```

### Zipping with Dependency Pruning
```bash
zip -r output.zip folder/ \
    -x "*/venv/*" -x "*/__pycache__/*" -x "*.pyc" \
    -x "*/.git/*" -x "*/node_modules/*" -x "*/.venv/*" \
    -x "*/site-packages/*" -x "*/.pytest_cache/*" \
    -x "*/.mypy_cache/*" -x "*.egg-info/*" -x "*.so" -x "*.dylib"
```

### Chat Log (MANDATORY for all sessions)

After completing any significant task or when zipping outputs, save a chat log:

**File:** `chat_history/{YYYY-MM-DD}_{topic_or_project}.md`

**Contents:**
- Date & duration
- Task summary
- Full conversation transcript
- Key findings/decisions
- Commands used
- Files created/modified

This preserves context for future sessions. The `chat_history/` folder is at the workspace root.

## Key Papers

- arXiv:2512.05117v2 - Universal Weight Subspace Hypothesis
- arXiv:2512.03750v1 - Universal Representations of Matter
- arXiv:2510.27688 - CALM (Continuous Autoregressive Language Models)
- arXiv:2103.15589 - RTRL (Real-Time Recurrent Learning)
- arXiv:2601.08102v1 - Violaris: Quantum observers, multiverse branches
- arXiv:2001.07307v4 - Spectral Variability in Hyperspectral Unmixing (Borsoi et al.)
- arXiv:2602.14445v1 - Selective Synchronization Attention (SSA, Hays 2026)

## SSA × FDRA Integration (Key Result)

**Control parameter:** Γ = u·κ/σ_ω (coupling strength × phase sharpness / frequency dispersion)
- Γ < 1 → multi-cluster sync (identity preserved, alignment tax = 0)
- Γ > 1 → global sync (identity collapses, alignment tax > 0)
- **Coupling clamp (u≤0.5, κ≤0.5) eliminates alignment tax: loss ratio 0.999±0.001 (6 runs, 2 scales)**
- Koopman eigenvalues on unit circle confirm spectral structure
- Deepest layers naturally develop lowest Γ (layer specialization emerges)
- See `experiments/ssa_fdra/` and `priorities/ssa_fdra_integration.md`

## Non-Negotiable Constraints

1. **No reward hacking assumptions** - Alignment is geometric, not behavioral
2. **No RLHF dependencies** - Basin stability is intrinsic
3. **All claims falsifiable** - Each experiment has clear pass/fail
4. **Prefer intrinsic diagnostics** - Measure geometry, not task accuracy
5. **N >= 10 per condition (HARD MINIMUM)** - n=2 or n=3 is an anecdote, not an experiment. Reduce conditions, not N.
6. **Effect sizes for every comparison** - "X > Y" without Cohen's d or equivalent is not a finding
7. **Bootstrap CIs for threshold/transition claims** - No claiming s_c = 0.20 without a confidence interval from 1000+ resamples
8. **No "universal" from single-model data** - One model = "observed in [model]", not "universal"

## Technology Stack

- Python 3.8+ (PyTorch >= 2.0.0, NumPy, SciPy)
- Gymnasium >= 0.29.0
- matplotlib, seaborn, pandas for visualization
- wandb for experiment tracking (optional)
- Private `fdra-core` package from agencyenterprise GitHub

## Claude Code Tips

### Extracting Context from Previous Chat Transcripts

Raw transcript files are too large for context windows. Convert first:

> "Before you review the transcript, please convert the raw .jsonl transcript file to markdown format, extracting only the user messages, system messages, and thinking blocks."

A 1.9 MB raw transcript becomes ~44 KB after conversion (98% reduction).
