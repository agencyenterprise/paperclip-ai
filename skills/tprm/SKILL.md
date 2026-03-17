# TPRM Skill

Use this skill when you are the **Operator** or **QA** agent in the TPRM Operator business.

It covers:
- Reading the vendor risk framework
- Indexing vendor evidence documents
- Mapping evidence to framework controls
- Applying the uncertainty gate
- Writing structured report drafts (`output/report-draft.json`)
- Writing telemetry traces (`output/trace.json`)

---

## Operator Workflow

### Step 1 — Read the framework

```bash
cat input/framework.json
```

Parse the 8 TPRM controls. For each control, note:
- `id` — used as the key in your output
- `description` — what the control requires
- `expected_evidence_types` — what kinds of documents to look for

### Step 2 — Index evidence

```bash
ls -la input/evidence/
find input/evidence -type f | sort
```

For zip files:
```bash
find input/evidence -maxdepth 1 -name "*.zip"
# Extract only if not already done:
unzip -o input/evidence/vendor_docs.zip -d input/evidence/extracted/vendor_docs
```

Read every file in `input/evidence/` (and extracted subdirs). Build a mental index:
- What document is it?
- What date was it issued or last reviewed?
- What is its scope?
- What controls might it be relevant to?

### Step 3 — Map evidence to controls

For each of the 8 TPRM controls:

1. Identify relevant documents from your index
2. Read the relevant sections
3. Extract a verbatim excerpt (do not paraphrase)
4. Note the document name, section, and date
5. Score your confidence honestly

Date currency rules (apply strictly):
- SOC 2 reports: must be issued within last **12 months**
- ISO 27001 certificates: must not be expired
- Pen test reports: must be conducted within last **12 months**
- Policies: must be reviewed within last **12 months** (check effective/review date)
- DR test results: must be conducted within last **12 months**

### Step 4 — Apply the uncertainty gate

```
confidence >= 0.75 AND citation present  →  proceed   (SUPPORTED)
0.40 <= confidence < 0.75                →  verify    (PARTIAL)
confidence < 0.40 OR no citation         →  escalate  (MISSING)
```

No exceptions. Do not override the gate. Do not round up.

### Step 5 — Write report-draft.json

```bash
cat > output/report-draft.json << 'EOF'
{
  "engagement_id": "<PAPERCLIP_TASK_ID>",
  "customer": "<vendor name>",
  "framework": "TPRM Vendor Security Assessment Framework",
  "audit_period": "<assessment date>",
  "generated_at": "<ISO8601>",
  "generated_by": "<PAPERCLIP_AGENT_ID>",
  "evidence_sources": {
    "files_indexed": ["<list of filenames>"]
  },
  "items": [ ... ],
  "summary": {
    "total_items": 8,
    "supported": 0,
    "partial": 0,
    "missing": 0
  }
}
EOF
```

### Step 6 — Write trace entry

Append to `output/trace.json` (create if it doesn't exist — start with `[]`):

```json
{
  "trace_id": "<uuid>",
  "run_id": "<PAPERCLIP_RUN_ID>",
  "issue_id": "<PAPERCLIP_TASK_ID>",
  "agent_role": "operator",
  "timestamp_start": "<ISO8601>",
  "timestamp_end": "<ISO8601>",
  "mechanism_applied": ["uncertainty_gated_execution"],
  "stats": {
    "items_processed": 8,
    "proceed": 0,
    "verify": 0,
    "escalate": 0
  },
  "corrections_by_reviewer": 0
}
```

### Step 7 — Comment on Paperclip task

Post a summary table:

```markdown
## Operator Report — [Vendor Name]

Evidence mapped. Uncertainty gate applied to all 8 controls.

| Control | Status | Gate | Confidence |
|---|---|---|---|
| TPRM-1 | SUPPORTED | ✓ Proceed | 0.92 |
| TPRM-2 | SUPPORTED | ✓ Proceed | 0.88 |
...

**Summary:** X supported, Y partial, Z escalated.

@QA — ready for your review.
```

---

## QA Workflow

### Step 1 — Read the Operator's draft

```bash
cat output/report-draft.json
```

### Step 2 — Re-read source documents independently

Do not trust the Operator's excerpts. Go back to the originals.

For all `verify` and `escalate` items — re-read every cited document yourself.
For `proceed` items — spot-check at least 3 (lowest confidence scores first).

Date checks are especially important:
- Find the actual issue/review/test date in each document
- Confirm it falls within the required recency window

### Step 3 — Fill qa_review for each control

For each control, add to the item in report-draft.json:

```json
"qa_review": {
  "reviewed_by": "<PAPERCLIP_AGENT_ID>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "<explanation>"
}
```

If you downgrade a `proceed` to `verify`, also update `gate_decision`.

### Step 4 — Append trace entry

Same format as Operator, with `"agent_role": "qa"`.

### Step 5 — Comment on Paperclip task

```markdown
## QA Review Complete — [Vendor Name]

Re-verified all controls independently.

**Changes from Operator draft:**
- TPRM-X: downgraded proceed → verify (reason: ...)

**Escalations requiring human review:**
- TPRM-Y: [reason]

@COO — QA complete.
```

---

## report-draft.json item schema

```json
{
  "id": "TPRM-1",
  "title": "Information Security Program",
  "status": "SUPPORTED | PARTIAL | MISSING",
  "gate_decision": "proceed | verify | escalate",
  "confidence_score": 0.85,
  "evidence": [
    {
      "document": "acme_security_policy_v3.pdf",
      "section": "Section 1 — Information Security Program",
      "excerpt": "verbatim text from the document...",
      "date": "2025-03-01",
      "relevance": "Demonstrates board-approved security program with named CISO ownership"
    }
  ],
  "gap_notes": "What is missing or why confidence is reduced",
  "qa_review": null
}
```

---

## Common mistakes to avoid

| Mistake | Correct behavior |
|---|---|
| Accepting a 2-year-old pen test | Escalate — must be within 12 months |
| Accepting a policy mention of testing as evidence of testing | Escalate — policy ≠ test results |
| Rounding confidence up to 0.75 to avoid escalating | Keep honest score; escalate if needed |
| Marking `SUPPORTED` when `gate_decision` is `escalate` | These are contradictory — fix to match |
| Trusting Operator excerpts without re-reading | QA must read originals independently |
