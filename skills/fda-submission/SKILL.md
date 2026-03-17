---
name: fda-submission
description: >
  Execute FDA premarket submission gap analysis workflows. Use when you are the
  Operator or QA agent in the FDA Submission Operator business. Covers: reading
  FDA submission frameworks, indexing submission documents, mapping documents to
  checklist requirements, applying uncertainty gates, writing structured gap
  reports, and writing telemetry traces.
---

# FDA Submission Operator Skill

This skill defines the domain workflow for the FDA Submission Operator business.
It is used by the **Operator Agent** (document mapping and gap analysis) and the **QA Agent** (verification).

---

## Workspace Layout

Every engagement has a workspace directory. Its path is in `PAPERCLIP_WORKSPACE_CWD`
or configured in the agent's `cwd`. The layout is:

```
workspace/
├── input/
│   ├── framework.json          ← FDA submission checklist (required)
│   └── evidence/               ← all uploaded submission documents
│       ├── clinical_study.pdf
│       ├── bench_tests.pdf
│       └── ...
├── output/
│   ├── report-draft.json       ← Operator writes here; QA reads and annotates
│   └── trace.json              ← append one entry per run (never overwrite)
└── TASK.md                     ← task context written by COO (read this first)
```

---

## framework.json Format

```json
{
  "framework": "FDA Premarket Submission Requirements",
  "version": "2024",
  "items": [
    {
      "id": "SUB-1",
      "title": "Device Description and Intended Use",
      "description": "...",
      "expected_evidence_types": ["indications for use statement", "device description document"]
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
  "framework": "FDA Premarket Submission Requirements",
  "submission_type": "510(k) | PMA | De Novo",
  "device_name": "<device name>",
  "audit_period": "<submission date or review date>",
  "generated_at": "<ISO8601>",
  "generated_by": "<operator-agent-id>",
  "evidence_sources": {
    "files_indexed": []
  },
  "items": [
    {
      "id": "SUB-1",
      "title": "Device Description and Intended Use",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.85,
      "evidence": [
        {
          "document": "device_description.pdf",
          "section": "Section 1.1 — Device Overview",
          "excerpt": "The CardioSense Model CS-100 is a non-invasive, wearable cardiac monitoring device...",
          "date": "2024-11-01",
          "relevance": "Directly describes device, intended use, and patient population per SUB-1 requirements"
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
  "notes": "Risk management report references ISO 14971:2007; current FDA expectation is ISO 14971:2019."
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
Note the submission type (510(k), PMA, De Novo) — this affects which checklist items are applicable.

### Step 2 — Load the submission framework
Read `input/framework.json`. Extract all item IDs, titles, descriptions, and expected evidence types.

### Step 3 — Index submission documents
Read all files in `input/evidence/`. For each document, note:
- filename
- document type (clinical study, bench test report, biocompatibility assessment, risk management file, labeling, etc.)
- date (important: FDA may reject data older than certain thresholds)
- which checklist items it could plausibly support
- regulatory standard referenced (ISO 10993, ISO 14971, IEC 62304, etc.) and version year

### Step 4 — Map documents to checklist items
For each checklist item:
1. Search your evidence index for relevant documents
2. Extract the most relevant excerpt (verbatim, with specific section citation)
3. Check that the correct standard version is referenced (not outdated)
4. Assign a `confidence_score` (0.0–1.0):
   - **0.9–1.0**: complete, current evidence with correct standards; no gaps
   - **0.7–0.89**: good evidence but minor issues (slightly indirect, standards version unclear)
   - **0.4–0.69**: partial evidence — document exists but incomplete, missing sections, or outdated standard
   - **0.0–0.39**: no usable evidence, or evidence clearly insufficient for FDA review

### Step 5 — Apply the uncertainty gate (required)

For every checklist item, apply this gate:

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
- any notable patterns (e.g., "multiple test reports reference outdated ISO standard versions")

Assign the QA subtask to `todo` status to wake the QA Agent.

---

## QA Agent Workflow (step by step)

### Step 1 — Read the draft
Read `output/report-draft.json`. Focus on items where `gate_decision` is `verify` or `escalate`.

### Step 2 — Re-verify each flagged item
For every item with `gate_decision != "proceed"`:
1. Re-read the cited source documents yourself (do not rely on Operator's excerpt alone)
2. Search for any additional evidence the Operator may have missed
3. Make an independent decision: confirmed / downgraded / escalated

### Step 3 — Also spot-check `proceed` items
Pick 2–3 `proceed` items at random. Re-read their citations. Special focus on:
- Are the cited standards current? (e.g., ISO 14971:2019 not 2007; ISO 10993-1:2018 not 2009)
- Is the test data within an acceptable timeframe for FDA review?
- Does the excerpt actually support the claim, or is it tangentially related?

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

Its purpose: **prevent confident-sounding outputs that lack supporting evidence.**

In FDA submissions, a false `SUPPORTED` classification could mean the customer files
a 510(k) with a missing biocompatibility assessment, triggering a Refuse-to-Accept (RTA)
letter that halts the review clock and costs 3–6 months of delay. For a PMA, a missed
major deficiency could cost $1M+/month in revenue delay.

The gate makes the system's uncertainty visible rather than hiding it.

**When in doubt: escalate, don't proceed.**

---

## Evidence Quality Rules — FDA-Specific

- **Standards versions matter.** A risk management file citing ISO 14971:2007 instead of
  ISO 14971:2019 will likely draw a major deficiency comment. Always check the edition year.
- **Test data age matters.** FDA generally expects bench test data and biocompatibility data
  to be from the final design (or a design equivalent). Data from a predecessor device may
  require bridging documentation.
- **Templates with placeholders are not evidence.** A filled-in eSTAR template draft is
  partial evidence. A finalized, signed document is full evidence.
- **Sterility certificates ≠ sterilization validation.** A certificate from a contract
  sterilizer is not the same as ISO 11135/11137 validation documentation.
- **Multiple documents corroborate each other.** A risk analysis supported by both the
  ISO 14971 risk management plan and actual test results is stronger than either alone.
- **Never manufacture evidence.** If no document addresses a checklist item, status is MISSING.
