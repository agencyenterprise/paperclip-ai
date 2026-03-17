---
name: credentialing
description: >
  Execute healthcare provider credentialing verification workflows. Use when you
  are the Operator or QA agent in the Healthcare Provider Credentialing Operator
  business. Covers: reading NCQA/URAC credentialing frameworks, indexing credential
  documents, mapping credentials to checklist items, checking expiration dates,
  applying uncertainty gates, writing structured verification draft reports, and
  writing telemetry traces.
---

# Healthcare Provider Credentialing Skill

This skill defines the domain workflow for the Healthcare Provider Credentialing Operator business.
It is used by the **Operator Agent** (credential mapping) and the **QA Agent** (verification review).

---

## Workspace Layout

Every engagement has a workspace directory. Its path is in `PAPERCLIP_WORKSPACE_CWD`
or configured in the agent's `cwd`. The layout is:

```
workspace/
├── input/
│   ├── framework.json         ← NCQA credentialing checklist (required)
│   └── evidence/              ← all uploaded credential documents
│       ├── medical_license.pdf
│       ├── malpractice_cert.pdf
│       └── ...
├── output/
│   ├── verification-draft.json  ← Operator writes here; QA reads and annotates
│   └── trace.json               ← append one entry per run (never overwrite)
└── TASK.md                      ← task context written by COO (read this first)
```

---

## framework.json Format

```json
{
  "framework": "NCQA Credentialing & Recredentialing Standards",
  "checklist_items": [
    {
      "id": "CR-1",
      "title": "State Medical License — Primary Source Verification",
      "description": "Verify current, unrestricted medical license...",
      "expected_evidence_types": ["state medical license certificate", "state board verification"],
      "expiration_check": true,
      "primary_source_required": true
    }
  ]
}
```

---

## verification-draft.json Format (Operator writes, QA annotates)

```json
{
  "engagement_id": "<paperclip-issue-id>",
  "framework": "NCQA Credentialing & Recredentialing Standards",
  "provider_name": "Dr. Jane Smith",
  "npi": "1234567890",
  "specialty": "Internal Medicine",
  "engagement_type": "Initial Credentialing",
  "organization": "Pacific Health System",
  "generated_at": "<ISO8601>",
  "generated_by": "<operator-agent-id>",
  "checklist_items": [
    {
      "id": "CR-1",
      "title": "State Medical License — Primary Source Verification",
      "status": "VERIFIED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.92,
      "evidence": [
        {
          "document": "ca_medical_license.pdf",
          "section": "License Details",
          "excerpt": "License Number: G-12345, Status: ACTIVE, Expiration: 06/30/2026",
          "date": "2026-02-15",
          "relevance": "Primary source verification of active CA medical license with 15 months remaining"
        }
      ],
      "gap_notes": "",
      "expiration_date": "2026-06-30",
      "expiring_soon": false,
      "qa_review": null
    }
  ],
  "summary": {
    "total_items": 9,
    "verified": 7,
    "partial": 1,
    "missing": 1,
    "escalated": 1
  }
}
```

`qa_review` is null when the Operator writes it. QA fills it in:

```json
"qa_review": {
  "reviewed_by": "<qa-agent-id>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "License verified against CA Breeze portal — expiration confirmed 06/30/2026."
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
    "mechanism_applied": ["uncertainty_gated_execution", "expiration_check"],
    "stats": {
      "items_processed": 9,
      "proceed": 7,
      "verify": 1,
      "escalate": 1,
      "expiring_soon_flagged": 0
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
Note: provider name, NPI, specialty, state(s), and engagement type (initial vs. recredentialing).

### Step 2 — Load the credentialing framework
Read `input/framework.json`. Extract all checklist item IDs, titles, descriptions, expected evidence types,
and flags like `expiration_check` and `primary_source_required`.

### Step 3 — Index credential documents
Read all files in `input/evidence/`. For each document, note:
- filename
- document type (license, DEA cert, board cert, malpractice insurance, OIG check, etc.)
- provider name on the document (verify it matches)
- expiration date (if present)
- issuing authority (is this a primary source document?)
- which checklist items it could support

### Step 4 — Map credentials to checklist items
For each checklist item:
1. Search your evidence index for relevant documents
2. Extract the most relevant excerpt (verbatim, with source location)
3. Check expiration date if `expiration_check: true`
4. Check if document is from a primary source if `primary_source_required: true`
5. Assign a `confidence_score` (0.0–1.0):
   - **0.9–1.0**: clear primary source document, current, matches provider, no ambiguity
   - **0.7–0.89**: good document but minor concerns (slightly indirect, minor gaps)
   - **0.4–0.69**: document present but not primary source, or expiring soon, or partially matching
   - **0.0–0.39**: no document, expired credential, or clearly insufficient

### Step 5 — Apply the uncertainty gate (required)

For every checklist item, apply this gate:

```
confidence >= 0.75 AND at least 1 evidence citation present
  → gate_decision = "proceed"
  → status = "VERIFIED" (or "PARTIAL" if evidence is incomplete but still ≥0.75)

0.40 <= confidence < 0.75
  → gate_decision = "verify"
  → status = "PARTIAL"

confidence < 0.40 OR no evidence citations
  → gate_decision = "escalate"
  → status = "MISSING"
```

**Special rules that always override the gate:**
- If credential is **expired**: `confidence = 0.0`, `gate_decision = "escalate"`, `status = "MISSING"`
- If malpractice insurance coverage is **below minimum limits**: `gate_decision = "escalate"`, `status = "MISSING"`
- If OIG check is **older than 30 days**: `gate_decision = "escalate"` regardless of confidence
- If NPDB query is older than 180 days (initial) or 24 months (recredentialing): `gate_decision = "escalate"`

**Flag expiring soon (within 90 days):** Set `expiring_soon: true` in the item and note in `gap_notes` — but do NOT automatically downgrade confidence if still valid.

**This gate is mandatory. Do not skip it. Do not round up confidence scores.**

### Step 6 — Write output/verification-draft.json
Write the full structured JSON. Populate `summary` counts.

### Step 7 — Write trace entry
Append one entry to `output/trace.json`.

### Step 8 — Update Paperclip
Post a comment on the issue with:
- total checklist items processed
- proceed / verify / escalate counts
- any expiring items flagged
- any notable patterns (e.g., "NPDB query is from 2025-09, will need refresh for recredentialing cycle")

If there are any `escalate` items: set issue status to `in_review` and assign to the QA Agent.
If all items are `proceed`: set issue status to `in_review` and assign to the QA Agent (still requires QA sign-off).

---

## QA Agent Workflow (step by step)

### Step 1 — Read the draft
Read `output/verification-draft.json`. Focus on items where `gate_decision` is `verify` or `escalate`.
Always pull the malpractice insurance and OIG/NPDB items regardless of their gate decision.

### Step 2 — Re-verify each flagged item
For every item with `gate_decision != "proceed"` (and always for malpractice + OIG/NPDB):
1. Re-read the cited source documents yourself
2. Check expiration dates independently
3. For malpractice: verify coverage limits meet the minimum ($1M/$3M unless otherwise stated)
4. For OIG: confirm search date is within 30 days
5. For NPDB: confirm query date is within the applicable window
6. Make an independent decision:
   - **confirmed**: Operator's assessment is correct
   - **downgraded**: evidence is weaker; lower confidence and update gate_decision
   - **escalated**: needs human review — expired, below limits, or insufficient

### Step 3 — Also spot-check `proceed` items
Pick 2–3 `proceed` items at random. Always include the state medical license.
Re-read their citations. Flag any where you disagree.

### Step 4 — Fill in `qa_review` for each item you reviewed

### Step 5 — Write trace entry

### Step 6 — Update Paperclip
Post a comment with:
- QA verdict summary
- Any items you downgraded or escalated
- Whether the draft is ready for human review
- Any expiring items that need proactive attention

---

## Uncertainty Gate — Why It Exists

Credentialing a provider without verified credentials creates direct legal and regulatory liability:
- CMS participation violations for unverified Medicare/Medicaid providers
- JCAHO/TJC MS.06 standards violations
- Malpractice exposure for the credentialing organization
- OIG exclusion violations ($50,000+ per claim)

The gate makes credential uncertainty visible rather than hiding it in fluent-sounding approvals.

**When in doubt: escalate, don't proceed.**
A correctly escalated item protects the organization.
A falsely proceeded item creates liability.

---

## Evidence Quality Rules

- **Never manufacture evidence.** If no document verifies a credential, the status is MISSING.
- **Primary source matters.** A copy of a license is weaker than a board verification letter.
- **Expiration is hard.** Expired = escalate, no exceptions.
- **Coverage limits are hard.** Below minimum = escalate, no exceptions.
- **Recency rules are hard.** OIG >30 days = escalate. NPDB >180 days (initial) or >24 months (recred) = escalate.
- **Name matching matters.** Document must be in the provider's name (allow for middle name variations).
- **NPI verification.** If the NPI on documents doesn't match, flag it.
