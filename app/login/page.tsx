import { redirect } from "next/navigation"
import { getSession, createSession, validateCredentials } from "@/lib/auth"
import { getLocale } from "@/lib/locale"
import { getTranslations } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"

export default async function LoginPage() {
  const session = await getSession()
  if (session) {
    redirect("/")
  }

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 glass-effect rounded-3xl shadow-movistar-lg border border-blue-100/50 p-10">
          <div className="flex justify-end mb-6">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          <div className="flex justify-center mb-10">
            <Image src="/movistar-logo.png" alt="Movistar" width={400} height={120} className="h-24 w-auto" priority />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black bg-gradient-to-r from-gray-900 via-[#0B6CFF] to-gray-900 bg-clip-text text-transparent mb-3">
              {t.appTitle}
            </h1>
            <p className="text-base text-gray-600 font-medium">{t.signInPrompt}</p>
          </div>

          <form action={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold text-gray-800">
                {t.username}
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                required
                className="w-full h-12 text-base shadow-sm"
                placeholder={t.enterUsername}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-gray-800">
                {t.password}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="w-full h-12 text-base shadow-sm"
                placeholder={t.enterPassword}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-movistar hover:opacity-90 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all"
            >
              {t.signIn}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
