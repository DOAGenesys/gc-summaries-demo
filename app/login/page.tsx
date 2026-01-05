import { redirect } from "next/navigation"
import { getSession, createSession, validateCredentials } from "@/lib/auth"
import { getLocale } from "@/lib/locale"
import { getTranslations } from "@/lib/i18n"
import { getLogoUrl, getPrimaryColor } from "@/lib/env"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Lock, ArrowRight, Sparkles } from "lucide-react"

// Helper functions
function adjustBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace("#", "")
  const num = parseInt(cleanHex, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "")
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default async function LoginPage() {
  const session = await getSession()
  if (session) {
    redirect("/")
  }

  const logoUrl = getLogoUrl()
  const primaryColor = getPrimaryColor()
  const locale = await getLocale()
  const t = getTranslations(locale)

  async function handleLogin(formData: FormData) {
    "use server"

    const username = formData.get("username") as string
    const password = formData.get("password") as string

    if (validateCredentials(username, password)) {
      await createSession()
      redirect("/")
    } else {
      redirect("/login?error=invalid")
    }
  }

  const isExternalLogo = logoUrl.startsWith("http://") || logoUrl.startsWith("https://")

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% -20%, ${hexToRgba(primaryColor, 0.12)}, transparent 70%),
            radial-gradient(ellipse 80% 60% at 100% 50%, ${hexToRgba(primaryColor, 0.08)}, transparent 60%),
            radial-gradient(ellipse 60% 60% at 0% 80%, ${hexToRgba(primaryColor, 0.06)}, transparent 50%),
            linear-gradient(180deg, #fafbff 0%, #f5f7ff 100%)
          `
        }}
      />

      {/* Animated Gradient Orbs */}
      <div
        className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-3xl animate-float opacity-30 -z-10"
        style={{ background: `radial-gradient(circle, ${hexToRgba(primaryColor, 0.3)}, transparent 70%)` }}
      />
      <div
        className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full blur-3xl animate-float-delayed opacity-20 -z-10"
        style={{ background: `radial-gradient(circle, ${hexToRgba(primaryColor, 0.25)}, transparent 70%)` }}
      />

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="w-full max-w-md relative">
        {/* Glow effect behind card */}
        <div
          className="absolute inset-0 blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle at center, ${primaryColor}, transparent 70%)` }}
        />

        {/* Login Card */}
        <div
          className="relative bg-white/90 backdrop-blur-xl rounded-3xl border p-10 animate-scale-in"
          style={{
            borderColor: hexToRgba(primaryColor, 0.15),
            boxShadow: `
              0 4px 6px ${hexToRgba(primaryColor, 0.02)},
              0 12px 24px ${hexToRgba(primaryColor, 0.05)},
              0 24px 48px ${hexToRgba(primaryColor, 0.08)},
              0 48px 96px ${hexToRgba(primaryColor, 0.1)}
            `
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-8 right-8 h-[3px] rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`
            }}
          />

          {/* Language Switcher */}
          <div className="flex justify-end mb-8">
            <LanguageSwitcher currentLocale={locale} primaryColor={primaryColor} />
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              {isExternalLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-20 w-auto" />
              ) : (
                <Image src={logoUrl} alt="Logo" width={400} height={120} className="h-20 w-auto" priority />
              )}
            </div>
          </div>

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-sm font-medium"
              style={{
                background: hexToRgba(primaryColor, 0.08),
                color: primaryColor
              }}
            >
              <Sparkles className="size-4" />
              AI-Powered Analytics
            </div>
            <h1
              className="text-3xl font-black mb-3"
              style={{
                background: `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor} 50%, #1a1a2e 100%)`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              {t.appTitle}
            </h1>
            <p className="text-gray-500 font-medium">{t.signInPrompt}</p>
          </div>

          {/* Form */}
          <form action={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold text-gray-700">
                {t.username}
              </Label>
              <div className="relative group">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="w-full h-13 text-base pl-4 pr-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-300"
                  style={{
                    '--tw-ring-color': hexToRgba(primaryColor, 0.3),
                  } as React.CSSProperties}
                  placeholder={t.enterUsername}
                />
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 3px ${hexToRgba(primaryColor, 0.1)}`
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700">
                {t.password}
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full h-13 text-base pl-4 pr-12 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white transition-all duration-300"
                  placeholder={t.enterPassword}
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 3px ${hexToRgba(primaryColor, 0.1)}`
                  }}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-13 text-white font-bold text-base rounded-xl group relative overflow-hidden transition-all duration-300 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
                boxShadow: `0 4px 20px ${hexToRgba(primaryColor, 0.35)}`
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t.signIn}
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              {/* Button shine effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)'
                }}
              />
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              Secure authentication · Enterprise-grade protection
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-2xl opacity-40 -z-10 rounded-full"
          style={{ background: primaryColor }}
        />
      </div>
    </div>
  )
}
