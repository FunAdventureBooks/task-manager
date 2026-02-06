"use client"

import { useState } from "react"

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      setAuthenticated(true)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (authenticated) return <>{children}</>

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-page)" }}>
      <div className="bg-white rounded-2xl p-10 shadow-lg w-full max-w-sm text-center">
        <h1 className="font-bold text-lg mb-1">◧ Task Manager</h1>
        <p className="text-sm text-gray-400 mb-6">Enter password to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-[#E0DCD4] bg-[#FAFAF8] text-sm outline-none focus:border-[#8B7E66] transition-colors mb-3"
            autoFocus
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#2C2C2C] text-white font-semibold text-sm cursor-pointer hover:bg-[#444] transition-colors"
          >
            Enter
          </button>
          {error && (
            <p className="text-red-500 text-xs mt-3">Incorrect password</p>
          )}
        </form>
      </div>
    </div>
  )
}
