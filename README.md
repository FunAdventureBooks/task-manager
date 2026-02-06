# Task Manager — Deployment Guide & OpenClaw Instructions

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│  Vercel (free)                                   │
│  ┌────────────────────────────────────────────┐  │
│  │  Next.js App                               │  │
│  │  • UI: Kanban board, timeline, archive     │  │
│  │  • Password-gated (env var)                │  │
│  │  • /api/tasks — REST API for OpenClaw      │  │
│  └────────────────────────────────────────────┘  │
│                        │                         │
│                        ▼                         │
│  ┌────────────────────────────────────────────┐  │
│  │  Supabase (free)                           │  │
│  │  • Postgres database                       │  │
│  │  • tasks table with RLS                    │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
         ▲                          ▲
         │ (browser)                │ (API)
       Robert                   OpenClaw
```

---

## Step 1: Robert Sets Up Supabase (5 minutes)

1. Go to https://supabase.com and sign up (free)
2. Click "New Project", pick a name and password, choose a region close to you
3. Once created, go to **SQL Editor** (left sidebar)
4. Paste the ENTIRE contents of `supabase-schema.sql` and click "Run"
5. Go to **Project Settings → API** and copy:
   - `Project URL` (looks like `https://abcdefg.supabase.co`)
   - `anon public` key
   - `service_role` key (click "Reveal" — keep this secret)

---

## Step 2: Robert Sets Up Vercel (5 minutes)

1. Push this entire `task-manager` folder to a GitHub repo
2. Go to https://vercel.com and sign up with GitHub (free)
3. Click "Import Project" and select your repo
4. In the **Environment Variables** section, add:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_APP_PASSWORD` | Any password you want |

5. Click "Deploy"
6. Your app is now live at `https://your-project.vercel.app`

---

## Step 3: Give OpenClaw API Access

OpenClaw needs two things:
- **API URL**: `https://your-project.vercel.app/api/tasks`
- **Auth token**: Your `SUPABASE_SERVICE_ROLE_KEY`

All requests must include the header:
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
```

---

## API Reference for OpenClaw

### List tasks
```
GET /api/tasks
GET /api/tasks?archived=true
```

### Create a task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Implement user auth",
  "description": "Add login/signup flow",
  "priority": "high",
  "labels": ["feature", "auth"],
  "owner": "dev",
  "status": "todo",
  "start_date": "2026-02-07",
  "expected_completion": "2026-02-14"
}
```

### Update a task
```
PATCH /api/tasks?id=<uuid>
Content-Type: application/json

{
  "status": "working",
  "description": "Updated description"
}
```

### Delete a task
```
DELETE /api/tasks?id=<uuid>
```

### Possible values
- **status**: `todo`, `working`, `blocked`, `completed`
- **priority**: `low`, `medium`, `high`
- **owner**: `robert`, `dev`

---

## OpenClaw Prompt

Copy everything below the line and give it to OpenClaw:

---

### SYSTEM CONTEXT: Task Manager Integration

You have access to a shared task management board that Robert uses to track work. You can read, create, update, and delete tasks via a REST API. Robert can see everything you do on the board in real time through a web UI.

**API Base URL**: `https://YOUR-PROJECT.vercel.app/api/tasks`

**Authentication**: Include this header on ALL requests:
```
Authorization: Bearer YOUR_SERVICE_ROLE_KEY_HERE
```

**Your responsibilities as "dev" on this board:**

1. **When you start a task**: Update its status to `working`
2. **When you finish a task**: Update its status to `completed`
3. **When you're blocked**: Update status to `blocked` and add a note in the description explaining why
4. **When Robert assigns you something**: You'll see tasks with `owner: "dev"` — pick these up in priority order (high → medium → low)
5. **When you complete subtasks or milestones**: Append to the task's history array so Robert can see progress
6. **Create new tasks** when you identify work that needs to be done (bugs found, refactors needed, etc.)

**API Methods:**

```bash
# List all active tasks
curl -H "Authorization: Bearer $TOKEN" https://BASE_URL/api/tasks

# List archived tasks
curl -H "Authorization: Bearer $TOKEN" "https://BASE_URL/api/tasks?archived=true"

# Create task
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Fix bug","priority":"high","owner":"dev","status":"todo","labels":["bug"]}' \
  https://BASE_URL/api/tasks

# Update task (change status, add notes, etc.)
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"working"}' \
  "https://BASE_URL/api/tasks?id=TASK_UUID"

# Delete task
curl -X DELETE -H "Authorization: Bearer $TOKEN" "https://BASE_URL/api/tasks?id=TASK_UUID"
```

**Field reference:**
- `status`: todo | working | blocked | completed
- `priority`: low | medium | high
- `owner`: robert | dev
- `labels`: array of strings like ["bug", "feature", "urgent"]
- `start_date`: ISO date string (YYYY-MM-DD) or null
- `expected_completion`: ISO date string or null
- `history`: array of strings — append progress notes, don't overwrite

**Rules:**
- Always check the board at the start of a session to see what's assigned to you
- Update task status as you work — Robert watches the board
- When creating tasks, set `owner` to `"dev"` for things you'll handle, `"robert"` for things Robert needs to decide on
- Keep descriptions concise but useful
- Use labels consistently: bug, feature, refactor, docs, infra, urgent
- History entries should be timestamped: "Feb 7 — Started implementing auth flow"

---

## Troubleshooting

**"Failed to load tasks"**: Check that your Supabase URL and anon key are correct in Vercel env vars.

**API returns 401**: Make sure the `Authorization: Bearer` header contains the exact `SUPABASE_SERVICE_ROLE_KEY`.

**Tasks not showing up**: Check that `archived` is `false` on the tasks. The board only shows non-archived tasks by default.

**Password not working**: The password is stored in `NEXT_PUBLIC_APP_PASSWORD` env var on Vercel. Update it there and redeploy if needed.
