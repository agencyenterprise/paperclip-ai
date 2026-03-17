---
name: medical-billing-audit
description: >
  Execute medical billing audit workflows. Use when you are the Operator
  or QA agent in the Medical Billing Audit business. Covers: reading billing
  frameworks, indexing evidence documents (superbills, EOBs, clinical notes,
  LCD/NCD policies), mapping claims to framework items, applying the uncertainty
  gate, writing structured draft audit reports, and writing telemetry traces.
---

# Medical Billing Audit Skill

This skill defines the domain workflow for the Medical Billing Audit business.
It is used by the **Operator Agent** (evidence mapping) and the **QA Agent** (verification).

---

## Workspace Layout

Every engagement has a workspace directory. Its path is configured in the agent's `cwd`. The layout is:

```
workspace/
├── input/
│   ├── framework.json         ← billing audit framework (required)
│   └── evidence/              ← all uploaded evidence documents
│       ├── superbill_2025_01.pdf
│       ├── clinical_note_patient_A.txt
│       ├── eob_medicare_q1.csv
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
  "framework": "CMS Medical Billing Audit Framework",
  "version": "2025",
  "description": "Checklist for auditing CPT/ICD codes against clinical documentation and payer policies.",
  "items": [
    {
      "id": "MBA-1",
      "title": "CPT Code Accuracy — Procedure Matches Documentation",
      "description": "The billed CPT code(s) must exactly match the procedure(s) documented in the clinical note.",
      "expected_evidence_types": ["clinical note", "superbill", "operative report"]
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
  "framework": "CMS Medical Billing Audit Framework",
  "audit_period": "<period, e.g. Q1 2025>",
  "generated_at": "<ISO8601>",
  "generated_by": "<operator-agent-id>",
  "evidence_sources": {
    "files_indexed": ["superbill_2025_01.pdf", "clinical_note_patient_A.txt"]
  },
  "items": [
    {
      "id": "MBA-1",
      "title": "CPT Code Accuracy — Procedure Matches Documentation",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.88,
      "evidence": [
        {
          "document": "clinical_note_patient_A.txt",
          "section": "Assessment and Plan",
          "excerpt": "Performed lumbar epidural steroid injection at L4-L5 under fluoroscopic guidance.",
          "date": "2025-01-15",
          "relevance": "Directly documents the procedure billed as CPT 64483"
        }
      ],
      "gap_notes": "",
      "qa_review": null
    }
  ],
  "summary": {
    "total_items": 0,
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
  "notes": "LCD policy is from 2021 — may not reflect current telehealth coverage rules."
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
Read `TASK.md` and the Paperclip issue to understand scope, payer focus, and CPT range.

### Step 2 — Load the billing framework
Read `input/framework.json`. Extract all item IDs, titles, descriptions, and expected evidence types.

### Step 3 — Index evidence documents
Read all files in `input/evidence/`. For each document, note:
- Filename
- Document type: superbill, EOB/remittance advice, clinical note, LCD/NCD policy, operative report, prior authorization, payer fee schedule
- Date of service / document date (critical for LCD currency and audit period coverage)
- Which framework items it could plausibly support

### Step 4 — Map evidence to framework items
For each framework item:
1. Search your evidence index for relevant passages
2. Extract the most relevant excerpt (verbatim, with source location)
3. Assign a `confidence_score` (0.0–1.0):
   - **0.9–1.0**: clear, direct, current documentation; CPT/ICD exactly matches clinical documentation; payer policy explicitly covers the procedure/diagnosis
   - **0.7–0.89**: good evidence but minor gaps (e.g., slightly outdated policy, ICD code is valid but not maximally specific)
   - **0.4–0.69**: partial or ambiguous evidence (e.g., superbill present but clinical note is vague, or missing payer-specific LCD for this procedure)
   - **0.0–0.39**: no usable evidence, contradictory documentation, or clearly insufficient

### Step 5 — Apply the uncertainty gate (required)

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
**In medical billing, False Claims Act liability makes this gate existentially important.**

### Step 6 — Write output/report-draft.json
Write the full structured JSON. Populate `summary` counts.

### Step 7 — Write trace entry
Append one entry to `output/trace.json`.

### Step 8 — Update Paperclip
Post a comment on the issue with:
- Total items processed
- proceed / verify / escalate counts
- Any notable patterns (e.g., "LCD policy for CPT 64483 is dated 2021 — may be superseded")

---

## QA Agent Workflow (step by step)

### Step 1 — Read the draft
Read `output/report-draft.json`. Focus on items where `gate_decision` is `verify` or `escalate`.

### Step 2 — Re-verify each flagged item
For every item with `gate_decision != "proceed"`:
1. Re-read the cited source documents yourself (do not rely on Operator's excerpt alone)
2. Check: Is the LCD/NCD policy current as of the claim date? Does the ICD-10 code appear in the LCD's covered diagnoses list? Is the procedure documented in the clinical note with enough detail?
3. Make an independent decision: **confirmed**, **downgraded**, or **escalated**

### Step 3 — Spot-check proceed items
Pick 2–3 `proceed` items at random. Re-read their citations. Flag any upcoding, unbundling, or POS mismatches.

### Step 4 — Fill in `qa_review` for each item you reviewed
Write your `qa_review` into the report-draft.json (in-place update).

### Step 5 — Write trace entry
Append one QA trace entry to `output/trace.json`.

### Step 6 — Update Paperclip
Post a comment with:
- QA verdict summary
- Any items you downgraded or escalated
- Whether the draft is ready for human review

---

## Uncertainty Gate — Why It Exists

The uncertainty gate prevents confident-sounding outputs that lack supporting evidence.

In medical billing, **customers rely on this output to decide which claims to submit, defend, or refund**. A false SUPPORTED classification on a claim without documentation could constitute a false claim under the False Claims Act — exposing the practice to treble damages and Medicare exclusion.

When in doubt: **escalate, don't proceed.** A correctly escalated item is a safe outcome.
A falsely proceeded item is a mission failure and a legal liability.

---

## Evidence Quality Rules

- **Never manufacture evidence.** If no document supports an item, the status is MISSING.
- **Never paraphrase evidence.** Use verbatim excerpts.
- **Date matters.** LCD policies more than 12–18 months old may be superseded by CMS updates.
- **Diagnosis specificity matters.** A superbill showing CPT 99214 with ICD Z00.00 (routine exam) does not support medical necessity for a chronic disease management code.
- **Modifier documentation is required.** A modifier on a superbill without a corresponding clinical note justification is unsupported.
- **Place of service must match location.** Billing POS 11 (office) when the service was facility-based results in incorrect payment.
