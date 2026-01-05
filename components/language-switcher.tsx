"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import { setLocale } from "@/lib/locale"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Monitor, Globe } from "lucide-react"
import type { Locale } from "@/lib/i18n"

interface LanguageSwitcherProps {
  currentLocale: Locale
  primaryColor?: string
}

const languages = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "nl", label: "NL" },
  { code: "it", label: "IT" },
  { code: "de", label: "DE" },
  { code: "ar", label: "AR" },
  { code: "el", label: "EL" },
  { code: "pl", label: "PL" },
  { code: "pt", label: "PT" },
] as const

export function LanguageSwitcher({ currentLocale, primaryColor = "#0B6CFF" }: LanguageSwitcherProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) {
      setIsOpen(false)
      return
    }
    setIsOpen(false)
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

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="gap-2 rounded-xl bg-white/50 hover:bg-white border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-300 min-w-[80px] justify-between"
      >
        <span className="font-bold text-gray-700">{currentLang.label}</span>
        <ChevronDown className={`size-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 p-1.5 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-premium-lg z-50 min-w-[240px] animate-in fade-in zoom-in-95 duration-200"
          style={{
            transformOrigin: 'top right',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
          }}
        >
          <div className="grid grid-cols-2 gap-1">
            {languages.map((lang) => {
              const isActive = lang.code === currentLocale
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLocaleChange(lang.code as Locale)}
                  className={`
                            flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                            ${isActive
                      ? 'text-white shadow-md transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                        `}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
                  } : undefined}
                >
                  <span>{lang.label}</span>
                  {isActive && <Check className="size-3.5" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
