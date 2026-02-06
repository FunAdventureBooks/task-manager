"use client"

import { Task, Status } from "@/lib/types"

const COLUMN_LABELS: Record<Status, string> = {
  todo: "To Do",
  working: "In Progress",
  blocked: "Blocked",
  completed: "Done",
}

const COLUMN_ACCENTS: Record<Status, string> = {
  todo: "#8B7E66",
  working: "#4A7C8F",
  blocked: "#8F4A4A",
  completed: "#4A8F56",
}

export default function TimelineView({
  tasks,
  onClickTask,
}: {
  tasks: Task[]
  onClickTask: (task: Task) => void
}) {
  const sorted = [...tasks].sort((a, b) => {
    const da = a.start_date || a.expected_completion || "9999"
    const db = b.start_date || b.expected_completion || "9999"
    return da.localeCompare(db)
  })

  if (sorted.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        No tasks yet.
      </div>
    )
  }

  return (
    <div className="max-w-4xl px-2">
      {sorted.map((task) => (
        <div
          key={task.id}
          onClick={() => onClickTask(task)}
          className="flex items-stretch mb-0.5 cursor-pointer rounded-lg overflow-hidden bg-white border border-[#F0EDE6] hover:shadow-md transition-shadow"
        >
          <div className="w-1 flex-shrink-0" style={{ background: COLUMN_ACCENTS[task.status] }} />
          <div className="flex-1 px-5 py-3.5 flex justify-between items-center gap-4">
            <div>
              <div className="font-semibold text-sm">{task.title}</div>
              <div className="text-[11px] text-gray-400 mt-1" style={{ fontFamily: "var(--font-mono)" }}>
                {COLUMN_LABELS[task.status]} · @{task.owner}
              </div>
            </div>
            <div
              className="flex gap-6 text-xs text-gray-400 flex-shrink-0"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <div>
                <span className="text-gray-300">start </span>
                {task.start_date || "—"}
              </div>
              <div>
                <span className="text-gray-300">due </span>
                {task.expected_completion || "—"}
              </div>
              <div>
                <span className="text-gray-300">done </span>
                {task.completed_at ? task.completed_at.slice(0, 10) : "—"}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
