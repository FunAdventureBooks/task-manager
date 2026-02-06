import { supabase } from "./supabase"
import { Task, TaskInput } from "./types"

// ─── Fetch ───────────────────────────────────────────────────────

export async function fetchTasks(includeArchived = false): Promise<Task[]> {
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false })
  if (!includeArchived) {
    query = query.eq("archived", false)
  }
  const { data, error } = await query
  if (error) throw error
  return data as Task[]
}

export async function fetchArchivedTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("archived", true)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return data as Task[]
}

// ─── Create ──────────────────────────────────────────────────────

export async function createTask(input: TaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as Task
}

// ─── Update ──────────────────────────────────────────────────────

export async function updateTask(id: string, updates: Partial<TaskInput>): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
  if (error) throw error
  return data as Task
}

// ─── Move (status change with history entry) ─────────────────────

export async function moveTask(id: string, newStatus: Task["status"]): Promise<Task> {
  // Fetch current task to append to history
  const { data: current, error: fetchErr } = await supabase
    .from("tasks")
    .select("history, status")
    .eq("id", id)
    .single()
  if (fetchErr) throw fetchErr
  if (current.status === newStatus) return current as Task

  const now = new Date()
  const history = [...(current.history || []), `Moved to ${newStatus} on ${now.toDateString()}`]
  const completedAt = newStatus === "completed" ? now.toISOString() : null

  return updateTask(id, { status: newStatus, history, completed_at: completedAt } as Partial<TaskInput>)
}

// ─── Archive / Restore ───────────────────────────────────────────

export async function archiveCompleted(): Promise<void> {
  const { error } = await supabase
    .from("tasks")
    .update({ archived: true, updated_at: new Date().toISOString() })
    .eq("status", "completed")
    .eq("archived", false)
  if (error) throw error
}

export async function restoreTask(id: string): Promise<Task> {
  const { data: current, error: fetchErr } = await supabase
    .from("tasks")
    .select("history")
    .eq("id", id)
    .single()
  if (fetchErr) throw fetchErr

  const history = [...(current.history || []), `Restored on ${new Date().toDateString()}`]
  return updateTask(id, { archived: false, status: "todo", completed_at: null, history } as Partial<TaskInput>)
}

// ─── Delete ──────────────────────────────────────────────────────

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) throw error
}
