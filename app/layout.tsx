import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Internal task board",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
