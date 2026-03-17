---
name: title6-compliance
description: >
  Execute Title VI antisemitism compliance audit workflows for universities under DOE
  Office for Civil Rights investigation. Use when you are the Incident Documentation
  Analyst, OCR Framework Mapper, or Civil Rights Audit Reviewer in the Title VI
  Antisemitism Compliance Audit business. Covers: reading the OCR Title VI compliance
  framework, indexing incident reports and policy documents, classifying incidents
  against the IHRA Working Definition, mapping evidence to OCR checklist requirements,
  applying uncertainty gates, writing structured draft compliance packages, and writing
  telemetry traces.
---

# Title VI Antisemitism Compliance Audit Skill

This skill defines the domain workflow for the Title VI Antisemitism Compliance Audit business.
It is used by three specialist agents:
- **Incident Documentation Analyst** (incident indexing and IHRA classification)
- **OCR Framework Mapper** (evidence mapping to Title VI checklist)
- **Civil Rights Audit Reviewer** (QA verification before OCR submission)

---

## Workspace Layout

Every engagement has a workspace directory. Its path is in `PAPERCLIP_WORKSPACE_CWD`
or configured in the agent's `cwd`. The layout is:

```
workspace/
├── input/
│   ├── framework.json                  ← Title VI OCR compliance checklist (required)
│   └── evidence/                       ← all uploaded university evidence documents
│       ├── incident_log.csv
│       ├── investigation_report_*.md
│       ├── non_discrimination_policy.md
│       ├── grievance_procedure.md
│       ├── remediation_plan.md
│       ├── ocr_correspondence.txt
│       └── ...
├── output/
│   ├── incident-analysis-draft.json    ← Analyst writes; Mapper reads as input
│   ├── report-draft.json               ← Mapper writes; QA reads and annotates
│   └── trace.json                      ← append one entry per agent run (never overwrite)
└── TASK.md                             ← task context written by COO (read this first)
```

---

## framework.json Format

```json
{
  "framework": "Title VI Antisemitism Compliance",
  "version": "DOE OCR 2024",
  "controls": [
    {
      "id": "T6-001",
      "title": "Incident Documentation and Reporting",
      "description": "...",
      "expected_evidence_types": ["incident report forms", "incident tracking log", "...]
    }
  ]
}
```

---

## incident-analysis-draft.json Format (Analyst writes)

```json
{
  "university": "<university name>",
  "ocr_reference": "<OCR case reference>",
  "analysis_period": "<date range>",
  "generated_at": "<ISO8601>",
  "analyst": "Incident Documentation Analyst",
  "summary": {
    "total_incidents": 0,
    "proceed": 0,
    "verify": 0,
    "escalate": 0
  },
  "incidents": [
    {
      "id": "INC-001",
      "date_reported": "<date>",
      "incident_type": "<type>",
      "location": "<campus location or online>",
      "ihra_classification": "<applicable IHRA example or 'not IHRA-covered'>",
      "university_response_documented": true,
      "response_timely": true,
      "response_adequate": true,
      "documentation_sources": [
        {
          "document": "<filename>",
          "section": "<relevant section>",
          "excerpt": "<key quote>",
          "date": "<document date>"
        }
      ],
      "confidence_score": 0.0,
      "gate_decision": "proceed|verify|escalate",
      "gap_notes": "<what is missing or ambiguous>"
    }
  ]
}
```

---

## report-draft.json Format (Mapper writes, QA annotates)

```json
{
  "university": "<university name>",
  "framework": "Title VI / OCR Antisemitism Compliance",
  "ocr_reference": "<OCR case reference>",
  "audit_period": "<date range>",
  "customer": "<university name>",
  "generated_at": "<ISO8601>",
  "summary": {
    "total_controls": 0,
    "supported": 0,
    "partial": 0,
    "missing": 0
  },
  "controls": [
    {
      "id": "T6-001",
      "title": "Incident Documentation and Reporting",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.85,
      "evidence": [
        {
          "document": "incident_log.csv",
          "section": "Rows 1-12",
          "date": "2023-10-14",
          "relevance": "Contemporaneous log of all reported incidents with dates and status"
        }
      ],
      "gap_notes": "",
      "qa_review": null
    }
  ]
}
```

`qa_review` is null when the Mapper writes it. The Civil Rights Audit Reviewer fills it in:

```json
"qa_review": {
  "reviewed_by": "<qa-agent-id>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "Investigation completion dates confirm timeliness for 2 of 3 incidents; INC-002 still open at time of OCR complaint filing."
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
    "agent_role": "incident-documentation-analyst | ocr-framework-mapper | civil-rights-audit-reviewer",
    "timestamp_start": "<ISO8601>",
    "timestamp_end": "<ISO8601>",
    "mechanism_applied": ["uncertainty_gated_execution", "ihra_definition_analysis"],
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

## Incident Documentation Analyst Workflow (step by step)

### Step 1 — Read task context
Read `TASK.md` and the Paperclip issue to understand scope, university name, and OCR reference.

### Step 2 — Index all evidence
Read every file in `input/evidence/`. For each file, note:
- filename and document type (incident report, investigation record, police report, email, etc.)
- date range covered
- which incidents it references

### Step 3 — Identify and classify incidents
For each incident found in evidence:
1. Extract: date, type, location, reporting party, university response
2. Classify against IHRA Working Definition examples:
   - Holocaust denial or trivialization
   - Calling for harm against Jewish people
   - Holding Jewish students collectively responsible for Israel's actions
   - Using antisemitic symbols or imagery
   - Applying double standards to Jewish students based on national origin or shared ancestry
   - Dehumanizing, demonizing, or stereotyping Jewish people

3. Assess documentation quality:
   - Is the incident recorded contemporaneously?
   - Was it reported to a university official?
   - Is there an acknowledgment of receipt?
   - Is there an investigation record?
   - Is there a finding or closure record?

### Step 4 — Apply the uncertainty gate

```
confidence >= 0.75 AND documentation present  →  proceed
0.40 <= confidence < 0.75                     →  verify
confidence < 0.40 OR no documentation         →  escalate
```

### Step 5 — Write output/incident-analysis-draft.json

### Step 6 — Write trace entry

### Step 7 — Update Paperclip
Post comment with incident count, proceed/verify/escalate breakdown, and notable patterns.
Set subtask to done so the COO activates the OCR Framework Mapper.

---

## OCR Framework Mapper Workflow (step by step)

### Step 1 — Read task context and Analyst output
Read `TASK.md`, the Paperclip issue, and `output/incident-analysis-draft.json`.
Understand what incidents have been classified and what their documentation gaps are.

### Step 2 — Load the framework
Read `input/framework.json`. Extract all checklist item IDs, titles, descriptions, and expected evidence types.

### Step 3 — Index additional evidence
Read all files in `input/evidence/` (policies, procedures, training records, OCR correspondence).
Note what each document is and which framework items it could support.

### Step 4 — Map evidence to each framework item
For each of the 8 checklist items:
1. Search evidence for relevant documents
2. Extract the most relevant excerpt (verbatim, with source location)
3. Assign confidence_score (0.0–1.0):
   - **0.9–1.0**: clear, complete, current evidence directly addressing the requirement
   - **0.7–0.89**: good evidence but with minor gaps (slightly dated, indirect, partial coverage)
   - **0.4–0.69**: partial or ambiguous evidence; coverage is incomplete
   - **0.0–0.39**: no usable evidence or evidence clearly insufficient

### Step 5 — Apply the uncertainty gate (mandatory)

```
confidence >= 0.75 AND evidence citation present
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

### Step 7 — Write trace entry

### Step 8 — Update Paperclip
Post comment with total items, proceed/verify/escalate counts, and notable patterns.
Set subtask to done so the COO activates the Civil Rights Audit Reviewer.

---

## Civil Rights Audit Reviewer Workflow (step by step)

### Step 1 — Read draft and context
Read `output/report-draft.json`, `output/incident-analysis-draft.json`, and the Paperclip issue.

### Step 2 — Re-verify all verify and escalate items
For every checklist item with `gate_decision != "proceed"`:
1. Re-read the cited source documents yourself
2. Check: Is the evidence from the correct investigation period? Is the policy current? Is the response complete?
3. Make an independent decision: **confirmed**, **downgraded**, or **escalated**

### Step 3 — Spot-check proceed items
Pick at least 3 `proceed` items (or all if fewer). Re-read their citations.
Flag any where evidence is weaker than the Mapper assessed.

### Step 4 — Fill in `qa_review` for each reviewed item

### Step 5 — Write trace entry

### Step 6 — Update Paperclip
Post comment with QA verdict, any items downgraded or escalated, and overall readiness.
Set subtask to done so the COO routes to human approval.

---

## Uncertainty Gate — Why It Exists

Universities use this output in active OCR proceedings. A false `SUPPORTED` classification
could cause the university to make representations to OCR that are contradicted by the
actual record — which is worse than not asserting the point at all.

**When in doubt: escalate, don't proceed.**

A correctly escalated item gives the university and its counsel the information they need
to make a strategic decision. A falsely proceeded item creates legal exposure.

---

## Title VI / IHRA Key References

**IHRA Working Definition of Antisemitism (2016):**
"Antisemitism is a certain perception of Jews, which may be expressed as hatred toward Jews. Rhetorical and physical manifestations of antisemitism are directed toward Jewish or non-Jewish individuals and/or their property, toward Jewish community institutions and religious facilities."

**IHRA-covered examples relevant to campus:**
- Calling for harm against Jewish people or the State of Israel as a collective
- Holocaust denial or distortion
- Applying double standards by requiring of Israel behavior not expected or demanded of other democratic nations
- Using classic antisemitic symbols (e.g., "Jews control the media")
- Holding Jewish students responsible for the actions of the Israeli government
- Harassing, intimidating, or physically assaulting Jewish students

**OCR response adequacy standard:**
The university must: (1) investigate promptly, (2) take interim measures as needed, (3) reach a reasonable finding, (4) take disciplinary action if warranted, and (5) remediate the hostile environment. Failure at any step can support a Title VI violation finding.

---

## Evidence Quality Rules

- **Never manufacture evidence.** If no document supports a checklist item, the status is MISSING.
- **Never paraphrase evidence into a different meaning.** Use verbatim excerpts.
- **Policy currency matters.** A policy last updated in 2019 may not reflect OCR's 2023 guidance.
- **Date matters.** Evidence must be from within or immediately preceding the OCR investigation period.
- **Indirect evidence reduces confidence.** A general diversity statement is weaker than a specific Title VI incident response procedure.
- **Multiple documents corroborate each other.** Two independent sources raise confidence.
