"use client"

import { Task } from "@/lib/types"

export default function ArchiveView({
  tasks,
  onRestore,
  onDelete,
}: {
  tasks: Task[]
  onRestore: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        No archived tasks yet. Completed tasks can be archived with &quot;Archive Done&quot;.
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between bg-white rounded-lg px-5 py-3.5 mb-1.5 border border-[#F0EDE6] opacity-75"
        >
          <div>
            <div className="font-semibold text-sm line-through decoration-gray-300">
              {task.title}
            </div>
            <div
              className="text-[11px] text-gray-400 mt-1"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              @{task.owner} · completed {task.completed_at ? task.completed_at.slice(0, 10) : "—"}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onRestore(task.id)}
              className="px-3.5 py-1.5 rounded-md border border-[#E0DCD4] text-gray-500 font-semibold text-xs cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Restore
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="px-3.5 py-1.5 rounded-md bg-red-50 text-red-700 font-semibold text-xs cursor-pointer hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
