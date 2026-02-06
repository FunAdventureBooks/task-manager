"use client"

import { useState } from "react"
import { Task, Status, Priority, Owner } from "@/lib/types"

const STATUSES: Status[] = ["todo", "working", "blocked", "completed"]
const PRIORITIES: Priority[] = ["low", "medium", "high"]
const OWNERS: Owner[] = ["robert", "dev"]
const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  working: "In Progress",
  blocked: "Blocked",
  completed: "Done",
}

export default function TaskModal({
  task,
  onSave,
  onDelete,
  onClose,
}: {
  task: Partial<Task>
  onSave: (data: Partial<Task>) => void
  onDelete?: (id: string) => void
  onClose: () => void
}) {
  const isNew = !task.id

  const [form, setForm] = useState({
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "medium",
    owner: task.owner || "robert",
    labels: task.labels ? task.labels.join(", ") : "",
    start_date: task.start_date || "",
    expected_completion: task.expected_completion || "",
    status: task.status || "todo",
  })

  function handleSave() {
    if (!form.title.trim()) return
    const now = new Date()
    const historyEntry = isNew
      ? `Created on ${now.toDateString()}`
      : `Edited on ${now.toDateString()}`

    onSave({
      ...task,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority as Priority,
      owner: form.owner as Owner,
      labels: form.labels.split(",").map((l) => l.trim()).filter(Boolean),
      start_date: form.start_date || null,
      expected_completion: form.expected_completion || null,
      status: form.status as Status,
      completed_at:
        form.status === "completed" && !task.completed_at
          ? now.toISOString()
          : form.status !== "completed"
          ? null
          : task.completed_at,
      history: [...(task.history || []), historyEntry],
    })
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-[#E0DCD4] bg-[#FAFAF8] text-sm outline-none focus:border-[#8B7E66] transition-colors"
  const labelClass =
    "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide"

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/35 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <h2 className="font-bold text-xl mb-6">
          {isNew ? "New Task" : "Edit Task"}
        </h2>

        <div className="flex flex-col gap-4">
          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Title *</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Description</label>
            <textarea
              className={`${inputClass} min-h-[70px] resize-y`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Details..."
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Priority</label>
              <select
                className={inputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Owner</label>
              <select
                className={inputClass}
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              >
                {OWNERS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Labels (comma separated)</label>
            <input
              className={inputClass}
              value={form.labels}
              onChange={(e) => setForm({ ...form, labels: e.target.value })}
              placeholder="bug, feature, ux"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Start Date</label>
              <input
                type="date"
                className={inputClass}
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>Expected Completion</label>
              <input
                type="date"
                className={inputClass}
                value={form.expected_completion}
                onChange={(e) => setForm({ ...form, expected_completion: e.target.value })}
              />
            </div>
          </div>

          {!isNew && task.history && task.history.length > 0 && (
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-mono)" }}>History</label>
              <div
                className="bg-[#FAFAF8] rounded-lg p-3 text-xs text-gray-400 leading-7"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {task.history.map((h, i) => (
                  <div key={i}>• {h}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-7 gap-3">
          {!isNew && onDelete && (
            <button
              onClick={() => onDelete(task.id!)}
              className="px-5 py-2.5 rounded-lg bg-red-50 text-red-700 font-semibold text-sm cursor-pointer hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          )}
          <div className="flex gap-2.5 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#E0DCD4] text-gray-500 font-semibold text-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-lg bg-[#2C2C2C] text-white font-semibold text-sm cursor-pointer hover:bg-[#444] transition-colors"
            >
              {isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
