import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { getLocale } from "@/lib/locale"
import { getTranslations } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LogOut, MessageSquare, Phone, Mail, Bot, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { logout } from "@/app/actions/auth"
import { LanguageSwitcher } from "@/components/language-switcher"

interface ConversationRow {
  id: number
  summary_type: string
  media_type: string
  language: string
  summary_id: string
  agent_id: string | null
  summary: string
  date_created: string
  insight_count: string
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  // Fetch all conversations with insight counts
  const conversations = await sql<ConversationRow[]>`
    SELECT 
      c.*,
      COUNT(i.id)::text as insight_count
    FROM conversations c
    LEFT JOIN insights i ON c.id = i.conversation_id
    GROUP BY c.id
    ORDER BY c.date_created DESC
  `

  const locale = await getLocale()
  const t = getTranslations(locale)

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case "call":
        return <Phone className="size-4" />
      case "email":
        return <Mail className="size-4" />
      case "message":
        return <MessageSquare className="size-4" />
      default:
        return <MessageSquare className="size-4" />
    }
  }

  const getSummaryTypeIcon = (summaryType: string) => {
    switch (summaryType.toLowerCase()) {
      case "virtualagent":
        return <Bot className="size-4" />
      case "agent":
        return <User className="size-4" />
      default:
        return <MessageSquare className="size-4" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 glass-effect border-b border-blue-100/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/movistar-logo.png" alt="Movistar" width={280} height={84} className="h-32 w-auto" priority />
              <div className="h-16 w-px bg-gradient-to-b from-transparent via-blue-300 to-transparent" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} />
              <form action={logout}>
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 shadow-sm hover:shadow-md transition-all bg-transparent"
                >
                  <LogOut className="size-4" />
                  {t.signOut}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white border-blue-100 shadow-movistar hover:shadow-movistar-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t.totalConversations}</p>
                  <p className="text-5xl font-black bg-gradient-to-br from-[#0B6CFF] to-[#0056d6] bg-clip-text text-transparent">
                    {conversations.length}
                  </p>
                </div>
                <div className="size-16 rounded-2xl gradient-movistar flex items-center justify-center shadow-lg">
                  <MessageSquare className="size-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100 shadow-movistar hover:shadow-movistar-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t.agentSummaries}</p>
                  <p className="text-5xl font-black bg-gradient-to-br from-[#0B6CFF] to-[#0056d6] bg-clip-text text-transparent">
                    {conversations.filter((c) => c.summary_type === "Agent").length}
                  </p>
                </div>
                <div className="size-16 rounded-2xl gradient-movistar flex items-center justify-center shadow-lg">
                  <User className="size-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-blue-100 shadow-movistar hover:shadow-movistar-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{t.virtualAgent}</p>
                  <p className="text-5xl font-black bg-gradient-to-br from-[#0B6CFF] to-[#0056d6] bg-clip-text text-transparent">
                    {conversations.filter((c) => c.summary_type === "VirtualAgent").length}
                  </p>
                </div>
                <div className="size-16 rounded-2xl gradient-movistar flex items-center justify-center shadow-lg">
                  <Bot className="size-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">{t.recentConversations}</h2>
            <p className="text-base font-medium text-gray-600">
              {conversations.length} {t.total}
            </p>
          </div>

          {conversations.length === 0 ? (
            <Card className="bg-white border-blue-100 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="size-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="size-10 text-[#0B6CFF]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t.noConversations}</h3>
                <p className="text-base text-gray-600">{t.noConversationsDescription}</p>
              </CardContent>
            </Card>
          ) : (
            conversations.map((conversation) => (
              <Link key={conversation.id} href={`/conversation/${conversation.id}`}>
                <Card className="bg-white border-blue-100 shadow-md hover:shadow-movistar-lg hover:border-[#0B6CFF] transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant="outline" className="gap-1.5 font-semibold">
                            {getSummaryTypeIcon(conversation.summary_type)}
                            {conversation.summary_type === "VirtualAgent" ? t.virtualAgentBadge : t.agent}
                          </Badge>
                          <Badge variant="secondary" className="gap-1.5 font-semibold">
                            {getMediaIcon(conversation.media_type)}
                            {conversation.media_type.toLowerCase() === "call"
                              ? t.call
                              : conversation.media_type.toLowerCase() === "email"
                                ? t.email
                                : conversation.media_type.toLowerCase() === "message"
                                  ? t.message
                                  : conversation.media_type}
                          </Badge>
                          <Badge variant="outline" className="font-semibold">
                            {conversation.language.toUpperCase()}
                          </Badge>
                          {Number.parseInt(conversation.insight_count) > 0 && (
                            <Badge className="gradient-movistar shadow-md font-semibold">
                              {conversation.insight_count}{" "}
                              {Number.parseInt(conversation.insight_count) === 1 ? t.insight : t.insightPlural}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold mb-2 line-clamp-2 text-balance leading-relaxed">
                          {conversation.summary}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium">
                          {formatDate(conversation.date_created)} · ID: {conversation.summary_id.slice(0, 8)}...
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
