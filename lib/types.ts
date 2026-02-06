export type Status = "todo" | "working" | "blocked" | "completed"
export type Priority = "low" | "medium" | "high"
export type Owner = "robert" | "dev"

export type Task = {
  id: string
  title: string
  description: string
  priority: Priority
  labels: string[]
  owner: Owner
  start_date: string | null
  expected_completion: string | null
  completed_at: string | null
  status: Status
  archived: boolean
  history: string[]
  created_at: string
  updated_at: string
}

// What the frontend sends when creating/updating
export type TaskInput = Omit<Task, "id" | "created_at" | "updated_at">
