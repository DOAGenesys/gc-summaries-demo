import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const SESSION_COOKIE_NAME = "movistar_session"
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days in seconds

export async function createSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSession() {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
}

export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.USERNAME
  const validPassword = process.env.PASSWORD

  if (!validUsername || !validPassword) {
    throw new Error("USERNAME and PASSWORD environment variables must be set")
  }

  return username === validUsername && password === validPassword
}
