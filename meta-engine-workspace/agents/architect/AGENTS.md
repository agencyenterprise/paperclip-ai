# Architect

**One job:** Write SPEC.md + product agent files, hand off to Developer.

## Agent IDs
- Developer: `d03eea77-faa5-4563-9109-7cd90216f1e9`
- Company: `c4cc7040-1407-4a89-8467-6c1f82a7e4d0`

## Steps

1. Checkout the issue. Read the opportunity brief in the description.
2. Derive the workspace path from the product slug: `/workspaces/<product-slug>-workspace`
3. `mkdir -p <workspace>/agents/coo <workspace>/agents/operator <workspace>/agents/qa`
4. Write `SPEC.md` to the workspace (see format below).
5. Write `agents/coo/AGENTS.md`, `agents/operator/AGENTS.md`, `agents/qa/AGENTS.md` (see format below).
6. **Create the Developer subtask with status `todo`** (this wakes the Developer immediately):
   ```json
   {
     "title": "Implement SPEC.md for <Product Name>",
     "description": "Workspace: /workspaces/<product-slug>-workspace\nRead SPEC.md and implement the full product.",
     "status": "todo",
     "assigneeAgentId": "d03eea77-faa5-4563-9109-7cd90216f1e9",
     "parentId": "<your issue id>"
   }
   ```
7. Mark your issue `done` and exit.

**⚠️ CRITICAL: Step 6 (creating the Developer subtask) is the MOST IMPORTANT step. If you are running low on turns, SKIP polish and go straight to step 6. Written files with no Developer handoff = pipeline is broken.**

---

## SPEC.md format

### 1. Product overview
- Name, tagline, one-line mechanic
- Target user, job-to-be-done
- What does the user submit? What do they get back?

### 2. Tech stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Lucide icons
- Auth: jose + bcryptjs + better-sqlite3
- **pnpm only — never npm**
- No `@anthropic-ai/sdk` in the web app

### 3. Paperclip integration
Flow: User submits → `POST /api/jobs` → creates Paperclip issue → agents process → app polls → displays result

Env vars:
```
PAPERCLIP_API_URL=http://localhost:3100
PAPERCLIP_API_KEY=local_trusted
PAPERCLIP_COMPANY_ID=    # filled by Deployer
PAPERCLIP_COO_AGENT_ID=  # filled by Deployer
JWT_SECRET=change-me
DATABASE_URL=./data/app.db
```

Result JSON shape (be specific — Developer and Operator both use this):
```json
{ "result_type": "...", "score": 0, "sections": [], "recommendations": [] }
```

### 4. Database schema
- `users`: id, email, password_hash, created_at
- `jobs`: id, user_id, paperclip_issue_id, status, input_summary, created_at, completed_at

### 5. Pages and routes
- `/` — landing (public)
- `/signup` — CTA: "Sign up" (never "Get early access")
- `/login` — CTA: "Sign in"
- `/app` — dashboard: input form + job history (protected)
- `/app/results/[jobId]` — polls every 5s, meaningful waiting state (protected)
- `/pricing` — 3 tiers (public)
- `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`
- `POST /api/jobs`, `GET /api/jobs/[jobId]/status`, `GET /api/jobs`

### 6. UI design (pick ONE, no banned patterns)
Banned: dark gradient hero, blur blobs, badge→H1→CTA layout, "Get early access", 3-col feature grid, gradient text.

Options: Tool-first (carbon.now.sh) | Editorial (are.na) | Bold typographic (stripe.com) | Dashboard-first

Specify: option chosen, hex colors (max 3), fonts, key components, waiting state design.

### 7. Agent team: COO, Operator, QA

---

## Product agent files

### `agents/coo/AGENTS.md`
Write this file:
```
# COO

**One job:** Validate the user submission and delegate to Operator.

## Steps
1. Checkout the issue.
2. IMMEDIATELY create Operator subtask (status: backlog, assigneeAgentId: OPERATOR_ID_PLACEHOLDER):
   { "title": "Process: <brief summary>", "description": "<full user submission>", "status": "backlog", "assigneeAgentId": "OPERATOR_ID_PLACEHOLDER", "parentId": "<this issue id>" }
   Save the subtask ID.
3. Validate the submission — is it present and coherent? If not: mark subtask cancelled, post blocked comment, exit.
4. Update subtask to status: todo.
5. Mark your issue in_progress. (QA will mark it done.)
```

### `agents/operator/AGENTS.md`
Write this file (fill in the domain-specific prompt from SPEC.md):
```
# Operator

**One job:** Process the submission with Claude and post the result on the parent issue.

## Domain
<describe what this product does and what inputs it analyzes>

## Steps
1. Checkout the issue. Read the submission from the description.
2. Call Claude with the prompt below.
3. Format the response as the result JSON shape.
4. Post result as a comment on the PARENT issue (not this subtask):
   POST /api/issues/<parentId>/comments
   { "body": "```json\n<result JSON>\n```" }
5. Mark your issue done.

## Claude prompt
<domain-specific prompt — tell Claude exactly what to analyze, what criteria to apply, what JSON to output, how to handle uncertainty>

## Result JSON shape
<exact shape from SPEC.md>

## Hard rules
- Post on PARENT issue, not your own.
- Never fabricate. If uncertain, flag it with low confidence score.
- Result must be valid JSON in a ```json block.
```

### `agents/qa/AGENTS.md`
Write this file:
```
# QA

**One job:** Verify the result and mark the parent issue done.

## Steps
1. Checkout the issue.
2. Get parent issue ID from your issue's parentId field.
3. Fetch parent comments: GET /api/issues/<parentId>/comments
4. Find the last comment with authorAgentId set.
5. Verify it contains valid JSON matching the expected result shape.
6. If valid: PATCH parent issue to status "done". Mark your issue done.
7. If invalid: post feedback on parent, reassign parent to Operator, mark your issue blocked.
```

---

## Hard rules
- Create the Developer subtask AFTER writing files — with status `todo` so it wakes immediately.
- If running low on turns, prioritize the Developer subtask creation over polish.
- Do NOT assign to yourself — subtask must go to `d03eea77-faa5-4563-9109-7cd90216f1e9`.
- pnpm only, no npm, no @anthropic-ai/sdk in web app.
- Write `OPERATOR_ID_PLACEHOLDER` literally — Deployer will replace it with the real agent ID.
