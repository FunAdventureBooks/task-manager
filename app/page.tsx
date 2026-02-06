"use client"

import { useEffect, useState, useCallback } from "react"
import { Task, Status } from "@/lib/types"
import {
  fetchTasks,
  fetchArchivedTasks,
  createTask,
  updateTask,
  moveTask as moveTaskApi,
  archiveCompleted,
  restoreTask,
  deleteTask,
} from "@/lib/tasks"
import BoardColumn from "@/components/BoardColumn"
import TaskModal from "@/components/TaskModal"
import TimelineView from "@/components/TimelineView"
import ArchiveView from "@/components/ArchiveView"
import PasswordGate from "@/components/PasswordGate"

const STATUSES: Status[] = ["todo", "working", "blocked", "completed"]

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([])
  const [view, setView] = useState<"board" | "timeline" | "archive">("board")
  const [modal, setModal] = useState<Partial<Task> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Data loading ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null)
      const [active, archived] = await Promise.all([
        fetchTasks(false),
        fetchArchivedTasks(),
      ])
      setTasks(active)
      setArchivedTasks(archived)
    } catch (err: any) {
      setError(err.message || "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // ─── Actions ─────────────────────────────────────────────────
  async function handleMove(id: string, status: Status) {
    try {
      await moveTaskApi(id, status)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleSave(data: Partial<Task>) {
    try {
      if (data.id) {
        const { id, created_at, updated_at, ...rest } = data as Task
        await updateTask(id, rest)
      } else {
        const { id, created_at, updated_at, ...rest } = data as any
        await createTask({
          ...rest,
          archived: false,
        })
      }
      setModal(null)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask(id)
      setModal(null)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleArchiveCompleted() {
    try {
      await archiveCompleted()
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleRestore(id: string) {
    try {
      await restoreTask(id)
      await loadData()
    } catch (err: any) {
      setError(err.message)
    }
  }

  // ─── Nav button helper ───────────────────────────────────────
  function navBtn(label: string, v: typeof view) {
    return (
      <button
        onClick={() => setView(v)}
        className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
          view === v
            ? "bg-[#2C2C2C] text-white"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <PasswordGate>
      <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
        {/* Header */}
        <header
          className="px-8 py-5 flex items-center justify-between border-b"
          style={{ background: "var(--bg-header)", borderColor: "var(--border-light)" }}
        >
          <div className="flex items-center gap-5">
            <h1 className="font-bold text-lg tracking-tight">◧ Task Manager</h1>
            <div className="flex gap-0.5 bg-[#F0EDE6] rounded-lg p-0.5">
              {navBtn("Board", "board")}
              {navBtn("Timeline", "timeline")}
              {navBtn("Archive", "archive")}
            </div>
          </div>
          <div className="flex gap-2.5 items-center">
            <button
              onClick={handleArchiveCompleted}
              className="px-4 py-2 rounded-lg border border-[#E0DCD4] text-gray-400 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Archive Done
            </button>
            <button
              onClick={() =>
                setModal({
                  title: "",
                  description: "",
                  priority: "medium",
                  labels: [],
                  owner: "robert",
                  start_date: null,
                  expected_completion: null,
                  completed_at: null,
                  status: "todo",
                  archived: false,
                  history: [],
                })
              }
              className="px-5 py-2 rounded-lg bg-[#2C2C2C] text-white font-semibold text-sm hover:bg-[#444] transition-colors"
            >
              + New Task
            </button>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mx-8 mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-3 underline">dismiss</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-gray-400">Loading tasks...</div>
        )}

        {/* Content */}
        {!loading && (
          <div className="px-8 py-6">
            {view === "board" && (
              <div className="grid grid-cols-4 gap-4">
                {STATUSES.map((s) => (
                  <BoardColumn
                    key={s}
                    status={s}
                    tasks={tasks.filter((t) => t.status === s)}
                    onMove={handleMove}
                    onDragStart={() => {}}
                    onClickTask={(t) => setModal(t)}
                  />
                ))}
              </div>
            )}

            {view === "timeline" && (
              <TimelineView tasks={tasks} onClickTask={(t) => setModal(t)} />
            )}

            {view === "archive" && (
              <ArchiveView
                tasks={archivedTasks}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {/* Modal */}
        {modal && (
          <TaskModal
            task={modal}
            onSave={handleSave}
            onDelete={handleDelete}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </PasswordGate>
  )
}
