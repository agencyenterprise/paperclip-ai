---
name: food-safety
description: >
  Execute food safety FSMA/HACCP compliance audit workflows. Use when you are
  the Operator or QA agent in the Food Safety Compliance Operator business.
  Covers: reading FSMA/HACCP frameworks, indexing food safety documents,
  mapping documents to framework items, applying uncertainty gates, writing
  structured gap audit reports, and writing telemetry traces.
---

# Food Safety Compliance Operator Skill

This skill defines the domain workflow for the Food Safety Compliance Operator business.
It is used by the **Operator Agent** (evidence mapping) and the **QA Agent** (verification).

---

## Workspace Layout

Every engagement has a workspace directory. Its path is in `PAPERCLIP_WORKSPACE_CWD`
or configured in the agent's `cwd`. The layout is:

```
workspace/
├── input/
│   ├── framework.json         ← FSMA/HACCP framework items (required)
│   └── evidence/              ← all uploaded food safety documents
│       ├── haccp_plan.pdf
│       ├── food_safety_plan.pdf
│       ├── sanitation_sops.pdf
│       └── ...
├── output/
│   ├── report-draft.json      ← Operator writes here; QA reads and annotates
│   └── trace.json             ← append one entry per run (never overwrite)
└── TASK.md                    ← task context written by COO (read this first)
```

---

## framework.json Format

```json
{
  "framework": "FSMA Preventive Controls + HACCP 7 Principles",
  "version": "FDA 21 CFR Part 117 / Codex Alimentarius 1997",
  "description": "...",
  "items": [
    {
      "id": "HACCP-1",
      "title": "Hazard Analysis",
      "description": "The facility has conducted and documented a hazard analysis...",
      "expected_evidence_types": ["HACCP plan with hazard analysis section", "Food Safety Plan hazard identification records"]
    }
  ]
}
```

---

## report-draft.json Format (Operator writes, QA annotates)

```json
{
  "engagement_id": "<paperclip-issue-id>",
  "customer": "<customer name>",
  "framework": "FSMA Preventive Controls + HACCP 7 Principles",
  "audit_period": "<period or date>",
  "generated_at": "<ISO8601>",
  "generated_by": "<operator-agent-id>",
  "evidence_sources": {
    "files_indexed": ["haccp_plan.pdf", "food_safety_plan.pdf"]
  },
  "items": [
    {
      "id": "HACCP-1",
      "title": "Hazard Analysis",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.88,
      "evidence": [
        {
          "document": "haccp_plan.pdf",
          "section": "Section 2 — Hazard Analysis",
          "excerpt": "Hazards identified include biological (Salmonella, Listeria monocytogenes)...",
          "date": "2025-01-15",
          "relevance": "Directly documents the hazard analysis for all product lines"
        }
      ],
      "gap_notes": "",
      "qa_review": null
    }
  ],
  "summary": {
    "total_items": 8,
    "supported": 0,
    "partial": 0,
    "missing": 0
  }
}
```

`qa_review` is null when the Operator writes it. QA fills it in:

```json
"qa_review": {
  "reviewed_by": "<qa-agent-id>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "Environmental monitoring records are from 2023; out of period for current audit."
}
```

---

## trace.json Format (append — never overwrite)

```json
[
  {
    "trace_id": "<uuid>",
    "run_id": "<PAPERCLIP_RUN_ID>",
    "issue_id": "<PAPERCLIP_TASK_ID>",
    "agent_role": "operator | qa | coo",
    "timestamp_start": "<ISO8601>",
    "timestamp_end": "<ISO8601>",
    "mechanism_applied": ["uncertainty_gated_execution"],
    "stats": {
      "items_processed": 8,
      "proceed": 5,
      "verify": 2,
      "escalate": 1
    },
    "corrections_by_reviewer": 0
  }
]
```

Read the existing `output/trace.json` first (if it exists), then append your entry, then write the whole array back.

---

## Operator Workflow (step by step)

### Step 1 — Read task context
Read `TASK.md` and the Paperclip issue (`GET /api/issues/$PAPERCLIP_TASK_ID`) to understand scope.

### Step 2 — Load the framework
Read `input/framework.json`. Extract all item IDs, titles, descriptions, and expected evidence types.

### Step 3 — Index evidence documents
Read all files in `input/evidence/`. For each document, note:
- filename
- document type (HACCP plan, Food Safety Plan, SOP, monitoring log, training record, recall plan, etc.)
- date (if visible)
- which framework items it could plausibly support

### Step 4 — Map evidence to framework items
For each framework item:
1. Search your evidence index for relevant sections
2. Extract the most relevant excerpt (verbatim, with source location)
3. Assign a `confidence_score` (0.0–1.0):
   - **0.9–1.0**: clear, direct, recent evidence; specific procedures documented with records
   - **0.7–0.89**: good evidence but minor gaps (e.g., slightly old records, one of several required elements)
   - **0.4–0.69**: partial evidence (e.g., policy exists but no records, or records are outdated)
   - **0.0–0.39**: no usable evidence, or evidence clearly insufficient

### Step 5 — Apply the uncertainty gate (required)

For every framework item, apply this gate:

```
confidence >= 0.75 AND at least 1 evidence citation present
  → gate_decision = "proceed"
  → status = "SUPPORTED"

0.40 <= confidence < 0.75
  → gate_decision = "verify"
  → status = "PARTIAL"

confidence < 0.40 OR no evidence citations
  → gate_decision = "escalate"
  → status = "MISSING"
```

**This gate is mandatory. Do not skip it. Do not round up confidence scores.**

### Step 6 — Write output/report-draft.json
Write the full structured JSON. Populate `summary` counts.

### Step 7 — Write trace entry
Append one entry to `output/trace.json`.

### Step 8 — Update Paperclip
Post a comment on the issue with:
- total items processed
- proceed / verify / escalate counts
- any notable patterns (e.g., "FSVP records entirely absent", "environmental monitoring records are from 2023")

Assign the issue to QA Agent and notify them.

---

## QA Agent Workflow (step by step)

### Step 1 — Read the draft
Read `output/report-draft.json`. Focus on items where `gate_decision` is `verify` or `escalate`.

### Step 2 — Re-verify each flagged item
For every item with `gate_decision != "proceed"`:
1. Re-read the cited source documents yourself (do not rely on Operator's excerpt alone)
2. Search for any additional evidence the Operator may have missed
3. Make an independent decision:
   - **confirmed**: Operator's assessment is correct, gate decision stands
   - **downgraded**: evidence is weaker than Operator rated; lower confidence
   - **escalated**: this needs human review; evidence is insufficient, contradictory, or out of period

### Step 3 — Also spot-check `proceed` items
Pick 2–3 `proceed` items at random (lowest confidence first). Re-read their citations. Flag any where you disagree.

### Step 4 — Fill in `qa_review` for each item you reviewed
Write your `qa_review` into the report-draft.json (in-place update).

### Step 5 — Write trace entry
Append one QA trace entry to `output/trace.json`.

### Step 6 — Update Paperclip
Post a comment with:
- QA verdict summary
- Any items you downgraded or escalated
- Whether the draft is ready for human review

If any items remain `escalate` after QA: create a Paperclip approval request for human review.
If all items are resolved: set issue status to `in_review`, assign to the COO for human approval routing.

---

## Uncertainty Gate — Why It Exists

The uncertainty gate is the core alignment mechanism in this business.

Its purpose: **prevent confident-sounding audit outputs that lack supporting evidence.**

FSMA violations result in FDA Warning Letters, consent decrees, and plant shutdowns. A false SUPPORTED
classification could cause a facility to enter an FDA inspection unprepared. The gate makes the system's
uncertainty visible rather than hiding it behind authoritative-sounding text.

When in doubt: **escalate, don't proceed.** A correctly escalated item is a good outcome.
A falsely proceeded item is a mission failure.

---

## Food Safety Evidence Quality Rules

- **Never manufacture evidence.** If no document supports a framework item, the status is MISSING.
- **Policy alone is not enough.** FSMA requires records. A policy statement without supporting operational records (logs, forms, training certificates) is partial at best.
- **Date matters.** Monitoring logs older than 12 months should reduce confidence significantly. Policies can be older if recently reviewed.
- **Scope matters.** A generic SOP that doesn't cover the specific product line or facility in scope is weaker than one that explicitly does.
- **All 7 HACCP principles must be addressed.** A HACCP plan missing corrective action procedures is partial even if hazard analysis and CCPs are excellent.
- **PCQI signature is required for FSMA.** A Food Safety Plan without a PCQI signature does not satisfy 21 CFR Part 117.
- **Foreign supplier records are separate.** FSVP under 21 CFR Part 1 Subpart L requires separate hazard evaluations and verification records for each foreign supplier.
