// src/lib/auth.ts
export const getCurrentUser = (): { id: string; username: string; nom?: string } | null => {
  try {
    const raw = localStorage.getItem("user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}