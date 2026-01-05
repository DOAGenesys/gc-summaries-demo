"use client"

import { useState, useTransition } from "react"
import { setLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Globe, Check } from "lucide-react"
import type { Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLocale: Locale
  primaryColor?: string
}

export function LanguageSwitcher({ currentLocale, primaryColor = "#0B6CFF" }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const [locale, setLocaleState] = useState<Locale>(currentLocale)

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return
    setLocaleState(newLocale)
    startTransition(async () => {
      await setLocale(newLocale)
      window.location.reload()
    })
  }

  // Helper to adjust color brightness
  const adjustBrightness = (hex: string, percent: number): string => {
    const cleanHex = hex.replace("#", "")
    const num = parseInt(cleanHex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLocaleChange("es")}
        disabled={isPending}
        className={`relative gap-1.5 rounded-lg font-semibold transition-all duration-300 ${locale === "es"
            ? "text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/80"
          }`}
        style={locale === "es" ? {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
        } : undefined}
      >
        {locale === "es" && <Check className="size-3.5" />}
        <span>ES</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleLocaleChange("en")}
        disabled={isPending}
        className={`relative gap-1.5 rounded-lg font-semibold transition-all duration-300 ${locale === "en"
            ? "text-white shadow-md"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/80"
          }`}
        style={locale === "en" ? {
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
        } : undefined}
      >
        {locale === "en" && <Check className="size-3.5" />}
        <span>EN</span>
      </Button>
    </div>
  )
}
