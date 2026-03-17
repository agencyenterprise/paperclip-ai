# Underwriting Operator Skill

Use this skill when you are the Operator or QA agent in the Underwriting Operator business.

Covers: reading underwriting frameworks, indexing submission documents (ACORD applications, loss runs, financial statements, inspection reports), mapping documents to framework items, applying the uncertainty gate, writing structured draft review reports, and writing telemetry traces.

---

## Operator Workflow

### Step 1 — Read the framework

```bash
cat input/framework.json
```

Note all item IDs, titles, and expected evidence types. You will produce one output entry per item.

### Step 2 — Index evidence documents

```bash
ls input/evidence/
find input/evidence -type f | sort
```

Check for zip files and extract if not already done:

```bash
find input/evidence -maxdepth 1 -name "*.zip"
# For each zip found:
target="input/evidence/extracted/submission_docs"
if [ ! -d "$target" ] || [ -z "$(ls -A $target)" ]; then
  unzip -o input/evidence/submission_docs.zip -d "$target"
else
  echo "Already extracted, skipping."
fi
```

Read each document. Note filename, document type, date, and key content relevant to each framework item.

### Step 3 — Map evidence to framework items

For each item in `framework.json`:
1. Find the most relevant document(s)
2. Extract a verbatim excerpt (do not paraphrase)
3. Note the specific section or page
4. Assign an honest confidence score

**Underwriting-specific evidence standards:**
- Loss runs: Must be 5 years minimum. Check frequency and severity trends. Open reserves are red flags.
- Financials: Must be CPA-audited. Unaudited management accounts → confidence max 0.65 (PARTIAL).
- Inspection reports: Must be within 24 months. Older → PARTIAL. Note all hazards.
- ACORD: All mandatory fields must be completed and signed. Unsigned or incomplete → confidence max 0.50.
- SIC/NAICS: Verify code matches actual operations. Mismatches → PARTIAL, note adjacent correct code.
- Prior carriers: Any non-renewal or cancellation by carrier → always flag reason.

### Step 4 — Apply the uncertainty gate (mandatory)

```
confidence >= 0.75 AND citation present  →  proceed   → status: SUPPORTED
0.40 <= confidence < 0.75                →  verify    → status: PARTIAL
confidence < 0.40 OR no citation         →  escalate  → status: MISSING
```

Do not round up. Do not infer evidence that isn't there. Escalating is correct.

### Step 5 — Write output/report-draft.json

```json
{
  "engagement_id": "<PAPERCLIP_TASK_ID>",
  "customer": "<applicant name from issue>",
  "framework": "Commercial Underwriting Review Framework",
  "line_of_business": "<line from issue>",
  "audit_period": "<submission date or review period>",
  "generated_at": "<ISO8601 now>",
  "generated_by": "<PAPERCLIP_AGENT_ID>",
  "evidence_sources": {
    "files_indexed": ["<list of files read>"]
  },
  "items": [
    {
      "id": "UW-1",
      "title": "Submission Completeness — ACORD Application",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.0,
      "evidence": [
        {
          "document": "<filename>",
          "section": "<section or field name>",
          "excerpt": "<verbatim text>",
          "date": "<document date>",
          "relevance": "<why this supports the item>"
        }
      ],
      "gap_notes": "<what is missing, weak, or flagged as a red flag>",
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

### Step 6 — Append to output/trace.json

```json
[
  {
    "trace_id": "<uuid>",
    "run_id": "<PAPERCLIP_RUN_ID>",
    "issue_id": "<PAPERCLIP_TASK_ID>",
    "agent_role": "operator",
    "timestamp_start": "<ISO8601>",
    "timestamp_end": "<ISO8601>",
    "mechanism_applied": ["uncertainty_gated_execution"],
    "stats": {
      "items_processed": 7,
      "proceed": 0,
      "verify": 0,
      "escalate": 0
    },
    "corrections_by_reviewer": 0
  }
]
```

Never overwrite trace.json. Read it first (if it exists), append your entry, write the full array back.

### Step 7 — Comment on Paperclip task

Post a summary table:

```markdown
## Underwriting Review Complete

| Item | Title | Status | Gate | Confidence |
|------|-------|--------|------|------------|
| UW-1 | ACORD Application | SUPPORTED | ✓ Proceed | 0.92 |
| UW-2 | Loss Runs (5yr) | PARTIAL | ⚠ Verify | 0.58 |
...

**Summary:** X proceed / Y verify / Z escalate

@QA please review report-draft.json.
```

---

## QA Workflow

### Step 1 — Read Operator's report

```bash
cat output/report-draft.json
```

Identify all `verify` and `escalate` items. Note `proceed` items with lowest confidence scores for spot-checking.

### Step 2 — Re-read source documents independently

For every `verify` and `escalate` item, go back to the original document in `input/evidence/` and read it yourself. Do not trust the Operator's excerpt alone — verify it says what the Operator claims.

For spot-checks on `proceed` items, re-read the cited document sections.

**Key things to verify in underwriting context:**
- Is the loss run current (5 years)? Are open reserves material?
- Are financials actually CPA-audited (check for audit opinion letter)?
- Is the inspection within 24 months? Were hazards noted but not flagged?
- Does the ACORD match the description of operations?
- Was any prior carrier non-renewal/cancellation flagged correctly?

### Step 3 — Fill in qa_review for each item reviewed

```json
"qa_review": {
  "reviewed_by": "<PAPERCLIP_AGENT_ID>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "<specific finding or confirmation>"
}
```

- **confirmed**: Evidence holds up. Confidence score is fair.
- **downgraded**: Evidence is weaker than rated. Reduce confidence and/or change gate_decision.
- **escalated**: Needs human underwriter attention — insufficient evidence, contradiction, or material red flag.

### Step 4 — Append to trace.json

Add a new entry with `agent_role: "qa"`. Record how many items you reviewed and any corrections made.

### Step 5 — Comment on Paperclip task

```markdown
## QA Review Complete

Re-read source documents for all verify/escalate items and spot-checked N proceed items.

**Changes made:**
- UW-X: downgraded from proceed → verify (reason)

**Items requiring underwriter attention:**
- UW-Y: [reason]

**Red flags surfaced:**
- [any material red flags not already in Operator report]

@COO QA review complete. Ready for human underwriter review.
```

---

## Output file locations

| File | Written by | Purpose |
|------|-----------|---------|
| `output/report-draft.json` | Operator (items), QA (qa_review fields) | Structured findings |
| `output/trace.json` | Operator + QA (append-only) | Telemetry |
| `output/underwriting-review-report.docx` | `node scripts/generate-report.js` | Human-readable report |
| `TASK.md` | COO | Engagement context |
