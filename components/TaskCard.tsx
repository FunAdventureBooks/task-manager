"use client"

import { Task } from "@/lib/types"

const PRIORITY_COLORS = {
  low: { bg: "#E8EEF0", text: "#4A7C8F" },
  medium: { bg: "#F5EDDA", text: "#9A7B2E" },
  high: { bg: "#F0E0E0", text: "#8F4A4A" },
}

const COLUMN_COLORS: Record<string, string> = {
  todo: "#8B7E66",
  working: "#4A7C8F",
  blocked: "#8F4A4A",
  completed: "#4A8F56",
}

export default function TaskCard({
  task,
  onDragStart,
  onClick,
}: {
  task: Task
  onDragStart: (id: string) => void
  onClick: (task: Task) => void
}) {
  const prio = PRIORITY_COLORS[task.priority]
  const accent = COLUMN_COLORS[task.status]

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id)
        e.dataTransfer.effectAllowed = "move"
        onDragStart(task.id)
      }}
      onClick={() => onClick(task)}
      className="bg-white rounded-lg p-3.5 mb-2.5 cursor-grab shadow-sm hover:shadow-md hover:-translate-y-px transition-all"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="font-semibold text-sm mb-2 leading-snug">{task.title}</div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
          style={{ background: prio.bg, color: prio.text, fontFamily: "var(--font-mono)" }}
        >
          {task.priority}
        </span>
        <span className="text-[11px] text-gray-400" style={{ fontFamily: "var(--font-mono)" }}>
          @{task.owner}
        </span>
        {task.labels.map((l) => (
          <span
            key={l}
            className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}
