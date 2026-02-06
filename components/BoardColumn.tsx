"use client"

import { useState } from "react"
import { Task, Status } from "@/lib/types"
import TaskCard from "./TaskCard"

const COLUMN_CONFIG: Record<Status, { label: string; bg: string; accent: string; dot: string }> = {
  todo: { label: "To Do", bg: "#F0ECE5", accent: "#8B7E66", dot: "#B8AD9A" },
  working: { label: "In Progress", bg: "#E8EEF0", accent: "#4A7C8F", dot: "#7FB3C4" },
  blocked: { label: "Blocked", bg: "#F0E8E8", accent: "#8F4A4A", dot: "#C47F7F" },
  completed: { label: "Done", bg: "#E8F0E9", accent: "#4A8F56", dot: "#7FC48A" },
}

export default function BoardColumn({
  status,
  tasks,
  onMove,
  onDragStart,
  onClickTask,
}: {
  status: Status
  tasks: Task[]
  onMove: (id: string, status: Status) => void
  onDragStart: (id: string) => void
  onClickTask: (task: Task) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const col = COLUMN_CONFIG[status]

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const taskId = e.dataTransfer.getData("text/plain")
        if (taskId) onMove(taskId, status)
      }}
      className="rounded-xl p-4 min-h-[65vh] transition-colors"
      style={{
        background: dragOver ? `${col.accent}18` : col.bg,
        border: dragOver ? `2px dashed ${col.accent}` : "2px solid transparent",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: col.dot }}
        />
        <span
          className="font-bold text-xs uppercase tracking-widest"
          style={{ color: col.accent }}
        >
          {col.label}
        </span>
        <span
          className="ml-auto text-xs font-semibold opacity-60"
          style={{ color: col.accent, fontFamily: "var(--font-mono)" }}
        >
          {tasks.length}
        </span>
      </div>

      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} onDragStart={onDragStart} onClick={onClickTask} />
      ))}
    </div>
  )
}
