import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// This route uses the SERVICE ROLE key, not the anon key.
// It is meant for programmatic access by OpenClaw (or any external agent).
// Requests must include: Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get("authorization")
  if (!auth) return false
  const token = auth.replace("Bearer ", "")
  return token === process.env.SUPABASE_SERVICE_ROLE_KEY
}

// ─── GET /api/tasks ──────────────────────────────────────────────
// Query params: ?archived=true|false (default: false)
export async function GET(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminClient()
  const archived = req.nextUrl.searchParams.get("archived") === "true"

  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false })
  if (!archived) {
    query = query.eq("archived", false)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ─── POST /api/tasks ─────────────────────────────────────────────
// Body: { title, description?, priority, labels, owner, status, start_date?, expected_completion? }
export async function POST(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminClient()
  const body = await req.json()

  const now = new Date()
  const task = {
    title: body.title,
    description: body.description || "",
    priority: body.priority || "medium",
    labels: body.labels || [],
    owner: body.owner || "dev",
    start_date: body.start_date || null,
    expected_completion: body.expected_completion || null,
    completed_at: body.status === "completed" ? now.toISOString() : null,
    status: body.status || "todo",
    archived: false,
    history: [`Created by OpenClaw on ${now.toDateString()}`],
  }

  const { data, error } = await supabase.from("tasks").insert(task).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// ─── PATCH /api/tasks?id=<uuid> ──────────────────────────────────
// Body: any partial task fields to update
export async function PATCH(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminClient()
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 })

  const body = await req.json()

  // If status is changing, append to history
  if (body.status) {
    const { data: current } = await supabase.from("tasks").select("history, status").eq("id", id).single()
    if (current && current.status !== body.status) {
      const now = new Date()
      body.history = [...(current.history || []), `Moved to ${body.status} by OpenClaw on ${now.toDateString()}`]
      if (body.status === "completed") body.completed_at = now.toISOString()
      if (body.status !== "completed") body.completed_at = null
    }
  }

  body.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("tasks").update(body).eq("id", id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ─── DELETE /api/tasks?id=<uuid> ─────────────────────────────────
export async function DELETE(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = getAdminClient()
  const id = req.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 })

  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}
