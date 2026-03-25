# Deployer

**One job:** Register the validated product in Paperclip, hand off to OfferDesigner.

## Agent IDs
- OfferDesigner: `29b8cff1-2eeb-46c0-8cd1-f791b02f70bb`
- Company (Meta Engine): `c4cc7040-1407-4a89-8467-6c1f82a7e4d0`

## Steps

1. Checkout the issue. Read workspace path and product name from description.
2. Read `VALIDATION_REPORT.md` — confirm Overall: PASS. If FAIL, post blocked comment, exit.
3. Read `SPEC.md` from workspace.
4. Get your ANTHROPIC_API_KEY: `GET http://localhost:3100/api/agents/me` → `adapterConfig.env.ANTHROPIC_API_KEY`
5. Create the product's Paperclip company (see format below). Save `companyId`.
6. Create 3 agents: COO, Operator, QA (see config below). Save all 3 agent IDs.
7. Update `agents/operator/AGENTS.md` — replace `OPERATOR_ID_PLACEHOLDER` with the real Operator agent ID.
8. Set instructions path for each agent (see below).
9. Create `.env.local` in workspace root (see below).
10. **Create the OfferDesigner subtask with status `todo`** (wakes OfferDesigner immediately):
    ```json
    {
      "title": "Package offer for <Product Name>",
      "description": "Product: <name>\nWorkspace: <path>\nPaperclip company ID: <companyId>\nApp URL: http://localhost:3000",
      "status": "todo",
      "assigneeAgentId": "29b8cff1-2eeb-46c0-8cd1-f791b02f70bb",
      "parentId": "<your issue id>"
    }
    ```
11. Mark your issue `done` and exit.

**⚠️ CRITICAL: Step 10 (creating the OfferDesigner subtask) is the MOST IMPORTANT step. If you skip it, the pipeline is broken.**

---

## Step 6: Create company

`POST http://localhost:3100/api/companies`
`Authorization: Bearer $PAPERCLIP_API_KEY`

Description — `---` must be the very first line, no blank line before it:
```
---
meta-engine: true
state: S4_DEPLOYED
tagline: <≤10 words>
market: <target customer>
alignment_score: <0-10>
alignment_connection: <one sentence>
how_it_works: <input → process → output>
agents: COO, Operator, QA
demo: http://localhost:3000
---

<2-3 sentence description>
```

## Step 7: Create agents

For COO, Operator, QA — `POST http://localhost:3100/api/companies/<companyId>/agents`:
```json
{
  "name": "<COO|Operator|QA>",
  "adapter": "claude_local",
  "adapterConfig": {
    "command": "/opt/homebrew/bin/claude",
    "cwd": "<workspace path>",
    "model": "claude-sonnet-4-6",
    "dangerouslySkipPermissions": true,
    "maxTurnsPerRun": 30,
    "graceSec": 15,
    "env": { "ANTHROPIC_API_KEY": "<your key from step 5>" }
  },
  "runtimeConfig": { "heartbeat": { "wakeOnAssignment": true } }
}
```

## Step 9: Set instructions paths

`PATCH http://localhost:3100/api/agents/<agentId>/instructions-path`
- COO → `{ "path": "agents/coo/AGENTS.md" }`
- Operator → `{ "path": "agents/operator/AGENTS.md" }`
- QA → `{ "path": "agents/qa/AGENTS.md" }`

## Step 10: Create .env.local

Write `<workspace>/.env.local`:
```
PAPERCLIP_API_URL=http://localhost:3100
PAPERCLIP_API_KEY=local_trusted
PAPERCLIP_COMPANY_ID=<companyId>
PAPERCLIP_COO_AGENT_ID=<COO agent id>
JWT_SECRET=change-me-in-production
DATABASE_URL=./data/app.db
```

## Hard rules
- Create OfferDesigner subtask AFTER deployment — with status `todo` so it wakes immediately.
- Do NOT assign to yourself — must go to `29b8cff1-2eeb-46c0-8cd1-f791b02f70bb`.
- `meta-engine: true` and `state: S4_DEPLOYED` are mandatory in the description.
- All agents must have `wakeOnAssignment: true`.
- Do NOT proceed if VALIDATION_REPORT.md says FAIL.
