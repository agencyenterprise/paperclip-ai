# Meta Engine Skill

Use this skill when building a new AI business product from a market opportunity.
It contains the full build checklist, API call patterns, and file templates.

---

## Build Checklist

Complete in order. Do not skip steps.

- [ ] 1. Read the reference compliance operator workspace
- [ ] 2. Create workspace directory on disk
- [ ] 3. Write agents/coo/AGENTS.md
- [ ] 4. Write agents/operator/AGENTS.md
- [ ] 5. Write agents/qa/AGENTS.md
- [ ] 6. Write input/framework.json
- [ ] 7. Create input/evidence/ directory (empty)
- [ ] 8. Create output/ directory (empty)
- [ ] 9. Write evals/cases/ (3 eval cases)
- [ ] 10. Write scripts/generate-report.js
- [ ] 11. Write README.md
- [ ] 12. Write skills/<slug>/SKILL.md in Paperclip repo
- [ ] 13. Create Paperclip company via API (use `Bearer local_trusted`)
- [ ] 14. PATCH company `requireBoardApprovalForNewAgents: false` (use `Bearer local_trusted`)
- [ ] 15. Create COO agent via `POST /api/companies/{id}/agents` (use agent JWT)
- [ ] 16. Create Operator agent (use agent JWT)
- [ ] 17. Create QA agent (use agent JWT)
- [ ] 18. Post completion report on task issue

---

## Paperclip API — Create Company

**Company creation requires board-level access. Use `Bearer local_trusted` (NOT your agent JWT) for these two calls.**
Your agent JWT gives agent-level access which is rejected. `Bearer local_trusted` is not a real token, so the server uses its default board identity (works in local_trusted dev mode).

```bash
curl -s -X POST "$PAPERCLIP_API_URL/api/companies" \
  -H "Authorization: Bearer local_trusted" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<Business Name>",
    "description": "<one sentence>",
    "issuePrefix": "<3-4 UPPERCASE LETTERS>"
  }'
```

Save the returned `id` as `COMPANY_ID`.

Immediately after, disable agent approval requirement (also needs board auth):

```bash
curl -s -X PATCH "$PAPERCLIP_API_URL/api/companies/$COMPANY_ID" \
  -H "Authorization: Bearer local_trusted" \
  -H "Content-Type: application/json" \
  -d '{"requireBoardApprovalForNewAgents": false}'
```

This makes all subsequent agent creation go straight to `idle` — no approval step needed.

---

## Paperclip API — Create Agent

Use `POST /api/companies/$COMPANY_ID/agents` (not agent-hires). Use your normal agent JWT here.

```bash
curl -s -X POST "$PAPERCLIP_API_URL/api/companies/$COMPANY_ID/agents" \
  -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "COO",
    "role": "general",
    "adapterType": "claude_local",
    "adapterConfig": {
      "cwd": "/Users/andrerodrigues/Dev/same-day-skunkworks/<slug>-workspace",
      "model": "claude-sonnet-4-6",
      "pathToClaude": "/Users/andrerodrigues/Library/Application Support/Claude/claude-code/2.1.72/claude",
      "instructionsFilePath": "/Users/andrerodrigues/Dev/same-day-skunkworks/<slug>-workspace/agents/coo/AGENTS.md",
      "addDirs": ["/Users/andrerodrigues/Dev/same-day-skunkworks/paperclip-ai/.claude/worktrees/jovial-grothendieck/skills"],
      "dangerouslySkipPermissions": true,
      "wakeOnAssignment": true
    }
  }'
```

Repeat for Operator (`role: "engineer"`) and QA (`role: "qa"`) with their respective AGENTS.md paths.
Since `requireBoardApprovalForNewAgents` is false, agents are immediately active — no approval needed.

---

## framework.json Template

Adapt this for the domain. Replace the SOC 2 controls with the domain's checklist items.

```json
{
  "framework": "<Domain Framework Name>",
  "version": "<version or year>",
  "description": "<what this framework assesses>",
  "items": [
    {
      "id": "ITEM-1",
      "title": "<checklist item title>",
      "description": "<what this item requires>",
      "expected_evidence_types": ["<doc type 1>", "<doc type 2>"]
    }
  ]
}
```

Include 4–8 items that cover the core requirements of the domain.

---

## report-draft.json Schema

All businesses use this output format. The Operator writes it, QA annotates it.

```json
{
  "engagement_id": "<paperclip-issue-id>",
  "customer": "<customer name>",
  "framework": "<framework name>",
  "audit_period": "<period or date>",
  "generated_at": "<ISO8601>",
  "generated_by": "<operator-agent-id>",
  "evidence_sources": {
    "files_indexed": []
  },
  "items": [
    {
      "id": "ITEM-1",
      "title": "<title>",
      "status": "SUPPORTED | PARTIAL | MISSING",
      "gate_decision": "proceed | verify | escalate",
      "confidence_score": 0.85,
      "evidence": [
        {
          "document": "<filename>",
          "section": "<section>",
          "excerpt": "<verbatim excerpt>",
          "date": "<document date>",
          "relevance": "<why this supports the item>"
        }
      ],
      "gap_notes": "<what is missing or weak>",
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

QA fills `qa_review`:
```json
"qa_review": {
  "reviewed_by": "<qa-agent-id>",
  "reviewed_at": "<ISO8601>",
  "decision": "confirmed | downgraded | escalated",
  "notes": "<explanation>"
}
```

---

## Uncertainty Gate (mandatory for all Operator agents)

The gate must be applied to every checklist item. No exceptions.

```
confidence >= 0.75 AND citation present  →  proceed   (SUPPORTED)
0.40 <= confidence < 0.75               →  verify    (PARTIAL)
confidence < 0.40 OR no citation        →  escalate  (MISSING)
```

This is the alignment mechanism. It prevents the agent from claiming evidence it
does not have. The gate must be described explicitly in every Operator AGENTS.md.

---

## trace.json Schema (append-only)

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
      "items_processed": 0,
      "proceed": 0,
      "verify": 0,
      "escalate": 0
    },
    "corrections_by_reviewer": 0
  }
]
```

Never overwrite trace.json. Always append a new entry.

---

## Eval Case Format

```json
{
  "eval_id": "eval-001",
  "description": "<what this tests>",
  "items_under_test": ["ITEM-1"],
  "evidence_files": [
    {
      "filename": "<filename>",
      "content_summary": "<realistic document summary>"
    }
  ],
  "expected_output": {
    "ITEM-1": {
      "status": "SUPPORTED",
      "gate_decision": "proceed",
      "min_confidence": 0.75
    }
  },
  "pass_criteria": "<one sentence describing what a passing result looks like>",
  "common_failure": "<one sentence describing the most likely wrong answer>"
}
```

---

## What makes a good COO AGENTS.md

The COO for any domain should:
1. Receive a new engagement issue from the board
2. Verify the workspace has a framework file and evidence directory
3. Write TASK.md with engagement context
4. Create an Operator subtask and a QA subtask (QA starts in backlog)
5. When Operator is done, activate QA
6. When QA is done, route to human review
7. Never do the analysis work itself

Keep the COO identical in structure to the compliance operator COO. Only change
the domain-specific terminology.

---

## What makes a good Operator AGENTS.md

The Operator for any domain should:
1. Read the framework file to understand what checklist items to assess
2. Index all evidence in input/evidence/ (handle zip files with extraction skip)
3. For each checklist item: find relevant evidence, extract excerpts, score confidence
4. Apply the uncertainty gate (mandatory)
5. Write report-draft.json and trace.json
6. Comment on the task with a summary table of results
7. Notify QA

The core constraint: every claim must have a verbatim excerpt from a real document
with a specific section citation. Never paraphrase or infer beyond the text.

---

## What makes a good QA AGENTS.md

The QA for any domain should:
1. Read the Operator's report-draft.json
2. Re-read source documents independently (not just trust Operator excerpts)
3. Re-verify all verify and escalate items
4. Spot-check at least 3 proceed items
5. Fill in qa_review for each item: confirmed / downgraded / escalated
6. Append to trace.json
7. Report to COO

QA is a second pair of eyes, not a rubber stamp. If the Operator was wrong, QA
must say so with evidence.
