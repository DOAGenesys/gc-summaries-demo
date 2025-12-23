"use client"

import { useState, useTransition } from "react"
import { setLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import type { Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const [locale, setLocaleState] = useState<Locale>(currentLocale)

  const handleLocaleChange = (newLocale: Locale) => {
    setLocaleState(newLocale)
    startTransition(async () => {
      await setLocale(newLocale)
      window.location.reload()
    })
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={locale === "es" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleLocaleChange("es")}
        disabled={isPending}
        className={locale === "es" ? "bg-[#0B6CFF] hover:bg-[#0B6CFF]/90" : "hover:bg-gray-200"}
      >
        <Globe className="size-3.5 mr-1.5" />
        ES
      </Button>
      <Button
        variant={locale === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleLocaleChange("en")}
        disabled={isPending}
        className={locale === "en" ? "bg-[#0B6CFF] hover:bg-[#0B6CFF]/90" : "hover:bg-gray-200"}
      >
        <Globe className="size-3.5 mr-1.5" />
        EN
      </Button>
    </div>
  )
}
