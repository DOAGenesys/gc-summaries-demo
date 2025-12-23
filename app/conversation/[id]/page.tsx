import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { getLocale } from "@/lib/locale"
import { getTranslations } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  Bot,
  User,
  Calendar,
  Globe,
  Hash,
  AlertCircle,
  CheckCircle,
  ListTodo,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ConversationRow {
  id: number
  summary_type: string
  media_type: string
  language: string
  summary_id: string
  agent_id: string | null
  source_id: string
  summary: string
  generated: boolean
  date_created: string
  created_at: string
}

interface InsightRow {
  id: number
  type: string
  title: string
  description: string
  outcome: string | null
}

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const locale = await getLocale()
  const t = getTranslations(locale)

  const { id } = await params
  const conversationId = Number.parseInt(id)

  if (isNaN(conversationId)) {
    notFound()
  }

  // Fetch conversation details
  const conversationResult = await sql<ConversationRow[]>`
    SELECT * FROM conversations WHERE id = ${conversationId}
  `

  if (conversationResult.length === 0) {
    notFound()
  }

  const conversation = conversationResult[0]

  // Fetch insights
  const insights = await sql<InsightRow[]>`
    SELECT * FROM insights WHERE conversation_id = ${conversationId}
    ORDER BY id ASC
  `

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType.toLowerCase()) {
      case "call":
        return <Phone className="size-5" />
      case "email":
        return <Mail className="size-5" />
      case "message":
        return <MessageSquare className="size-5" />
      default:
        return <MessageSquare className="size-5" />
    }
  }

  const getSummaryTypeIcon = (summaryType: string) => {
    switch (summaryType.toLowerCase()) {
      case "virtualagent":
        return <Bot className="size-5" />
      case "agent":
        return <User className="size-5" />
      default:
        return <MessageSquare className="size-5" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "reason":
        return <AlertCircle className="size-5 text-blue-600" />
      case "resolution":
        return <CheckCircle className="size-5 text-green-600" />
      case "actionitem":
        return <ListTodo className="size-5 text-orange-600" />
      default:
        return <MessageSquare className="size-5 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 glass-effect border-b border-blue-100/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/movistar-logo.png" alt="Movistar" width={280} height={84} className="h-16 w-auto" priority />
              <div className="h-8 w-px bg-gradient-to-b from-transparent via-blue-300 to-transparent" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                {t.conversationDetails}
              </h1>
            </div>
            <Link href="/">
              <Button
                variant="outline"
                size="default"
                className="gap-2 shadow-sm hover:shadow-md transition-all bg-transparent"
              >
                <ArrowLeft className="size-4" />
                {t.backToDashboard}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {/* Summary Card */}
          <Card className="bg-white border-blue-100 shadow-movistar-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
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
                {conversation.generated && (
                  <Badge className="gradient-movistar shadow-md font-semibold">{t.aiGenerated}</Badge>
                )}
              </div>
              <CardTitle className="text-3xl font-bold text-balance leading-relaxed">{t.conversationSummary}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 leading-relaxed text-pretty">{conversation.summary}</p>
            </CardContent>
          </Card>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-2xl gradient-movistar flex items-center justify-center shrink-0 shadow-md">
                    <Calendar className="size-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-2">{t.dateCreated}</p>
                    <p className="text-sm text-gray-600 font-medium">{formatDate(conversation.date_created)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-2xl gradient-movistar flex items-center justify-center shrink-0 shadow-md">
                    <Globe className="size-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-2">{t.language}</p>
                    <p className="text-sm text-gray-600 font-medium">
                      {conversation.language === "es"
                        ? t.spanish
                        : conversation.language === "en"
                          ? t.english
                          : conversation.language}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-2xl gradient-movistar flex items-center justify-center shrink-0 shadow-md">
                    <Hash className="size-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-2">{t.summaryId}</p>
                    <p className="text-xs text-gray-600 font-mono break-all">{conversation.summary_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="size-14 rounded-2xl gradient-movistar flex items-center justify-center shrink-0 shadow-md">
                    <Hash className="size-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 mb-2">{t.sourceId}</p>
                    <p className="text-xs text-gray-600 font-mono break-all">{conversation.source_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {conversation.agent_id && (
              <Card className="bg-white border-blue-100 md:col-span-2 shadow-md hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="size-14 rounded-2xl gradient-movistar flex items-center justify-center shrink-0 shadow-md">
                      <User className="size-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 mb-2">{t.agentId}</p>
                      <p className="text-xs text-gray-600 font-mono break-all">{conversation.agent_id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {t.insights} ({insights.length})
              </h2>

              {insights.map((insight) => (
                <Card key={insight.id} className="bg-white border-blue-100 shadow-md hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getInsightIcon(insight.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="font-semibold">
                            {insight.type.toLowerCase() === "reason"
                              ? t.reason
                              : insight.type.toLowerCase() === "resolution"
                                ? t.resolution
                                : insight.type.toLowerCase() === "actionitem"
                                  ? t.actionItem
                                  : insight.type}
                          </Badge>
                          {insight.outcome && (
                            <Badge variant="secondary" className="font-semibold">
                              {insight.outcome}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-bold mb-3 text-balance">{insight.title}</CardTitle>
                        <CardDescription className="text-base text-pretty leading-relaxed">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
