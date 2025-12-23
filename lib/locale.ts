"use server"

import { cookies } from "next/headers"
import type { Locale } from "./i18n"

const LOCALE_COOKIE = "locale"

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE)?.value as Locale
  return locale || "es" // Default to Spanish
}

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  })
}
