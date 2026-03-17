# ESG Operator Skill

Use this skill when you are the Operator or QA agent in the ESG Operator business.

Covers: reading ESG framework files, indexing sustainability evidence documents,
mapping disclosure claims to ESRS/GRI/TCFD standards, applying the uncertainty gate,
writing structured verification draft reports, and writing telemetry traces.

---

## Operator Workflow

### Step 1 — Read the framework

```bash
cat input/framework.json
```

Note all item IDs and their `expected_evidence_types`.

### Step 2 — Index evidence

List all files in `input/evidence/` recursively. For each file:
- Record filename, size, and a brief description of contents
- Check for zip files and extract if not already done (see Operator AGENTS.md for extraction rules)
- Note which items each file is likely relevant to based on filename and content

### Step 3 — Map each disclosure item

For each item in `framework.json`:

1. Search for relevant evidence across all indexed files
2. Extract verbatim excerpts with section citations
3. Assign a confidence score (0.0 – 1.0):
   - 0.90–1.0: multiple corroborating documents, third-party verified, current period
   - 0.75–0.89: single strong document, current period, clear citation
   - 0.40–0.74: evidence exists but has gaps (old date, partial scope, no assurance)
   - 0.00–0.39: no relevant evidence found, or evidence is clearly inadequate

4. Apply the uncertainty gate:
   ```
   confidence >= 0.75 AND citation present  →  proceed   (SUPPORTED)
   0.40 <= confidence < 0.75                →  verify    (PARTIAL)
   confidence < 0.40 OR no citation         →  escalate  (MISSING)
   ```

### Step 4 — ESG-specific quality checks

Before assigning any score, verify:
- [ ] Evidence is from within the reporting period (check dates explicitly)
- [ ] GHG figures are in tCO2e; energy in MWh or GJ (flag unit inconsistencies)
- [ ] Scope 1/2/3 coverage matches what the item requires
- [ ] Materiality claims have a documented materiality assessment backing them
- [ ] Third-party assurance statements are present where required

### Step 5 — Write report-draft.json

Write to `output/report-draft.json` using this schema:

```json
{
  "engagement_id": "<PAPERCLIP_TASK_ID>",
  "customer": "<customer name from TASK.md>",
  "framework": "ESG Disclosure Verification Framework",
  "audit_period": "<reporting period from TASK.md>",
  "generated_at": "<ISO8601 timestamp>",
  "generated_by": "<PAPERCLIP_AGENT_ID>",
  "evidence_sources": {
    "files_indexed": ["<list of filenames>"]
  },
  "items": [
    {
      "id": "ESG-E1",
      "title": "<from framework.json>",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.85,
      "evidence": [
        {
          "document": "<filename>",
          "section": "<section or page reference>",
          "excerpt": "<verbatim quote>",
          "date": "<document date>",
          "relevance": "<why this supports the item>"
        }
      ],
      "gap_notes": "<what is missing or weak — required for verify/escalate>",
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

### Step 6 — Write trace.json

Append (never overwrite) to `output/trace.json`:

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

### Step 7 — Comment on the Paperclip task

Post a summary table:

```markdown
## Disclosure Mapping Complete

| Item | Title | Status | Gate | Confidence |
|------|-------|--------|------|------------|
| ESG-E1 | GHG Scope 1 & 2 | SUPPORTED | ✓ proceed | 0.88 |
| ESG-E2 | Scope 3 | MISSING | ✗ escalate | 0.22 |
...

**Files indexed:** 5
**Proceed:** X | **Verify:** Y | **Escalate:** Z

QA review task activated.
```

---

## QA Workflow

### Step 1 — Read the Operator's report

```bash
cat output/report-draft.json
```

Note all `verify` and `escalate` items. Note the 3 lowest-confidence `proceed` items for spot-checking.

### Step 2 — Re-read source documents

For every `verify` and `escalate` item, re-read the relevant evidence files yourself.
Do not simply trust the Operator's excerpts.

For the 3 lowest-confidence `proceed` items, do the same.

### Step 3 — Apply ESG-specific QA checks

For each item you review:
- Confirm the evidence date falls within the reporting period
- Confirm units and methodology match framework requirements
- Confirm scope coverage matches what the item requires
- Check for any documents in `input/evidence/` the Operator may have missed

### Step 4 — Fill in qa_review

For each reviewed item, fill the `qa_review` field:

```json
"qa_review": {
  "reviewed_by": "<PAPERCLIP_AGENT_ID>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "<explanation — required>"
}
```

If downgrading: update `confidence_score` and `gate_decision` in the item as well.

### Step 5 — Append to trace.json

```json
{
  "trace_id": "<uuid>",
  "run_id": "<PAPERCLIP_RUN_ID>",
  "issue_id": "<PAPERCLIP_TASK_ID>",
  "agent_role": "qa",
  "timestamp_start": "<ISO8601>",
  "timestamp_end": "<ISO8601>",
  "mechanism_applied": ["uncertainty_gated_execution"],
  "stats": {
    "items_processed": <count reviewed>,
    "proceed": 0,
    "verify": 0,
    "escalate": 0
  },
  "corrections_by_reviewer": <count of items downgraded or escalated>
}
```

### Step 6 — Comment on the Paperclip task

List any items changed and overall verdict. @-mention COO to trigger routing.
