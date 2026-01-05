import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { getLocale } from "@/lib/locale"
import { getTranslations } from "@/lib/i18n"
import { getLogoUrl, getPrimaryColor } from "@/lib/env"
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
  Users,
  Calendar,
  Globe,
  Hash,
  AlertCircle,
  CheckCircle,
  ListTodo,
  Link2,
  Sparkles,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ConversationRow, InsightRow } from "@/lib/types"

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

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const logoUrl = getLogoUrl()
  const primaryColor = getPrimaryColor()
  const locale = await getLocale()
  const t = getTranslations(locale)

  const { id } = await params
  const conversationId = Number.parseInt(id)

  if (isNaN(conversationId)) {
    notFound()
  }

  const conversationResult = await sql<ConversationRow[]>`
    SELECT * FROM conversations WHERE id = ${conversationId}
  `

  if (conversationResult.length === 0) {
    notFound()
  }

  const conversation = conversationResult[0]

  const insights = await sql<InsightRow[]>`
    SELECT * FROM insights WHERE conversation_id = ${conversationId}
    ORDER BY id ASC
  `

  let childSummaries: ConversationRow[] = []
  if (conversation.summary_type === "Conversation") {
    childSummaries = await sql<ConversationRow[]>`
      SELECT * FROM conversations 
      WHERE conversation_id = ${conversation.summary_id} 
      AND summary_type != 'Conversation'
      ORDER BY date_created ASC
    `
  }

  const getMediaIcon = (mediaType: string, className = "size-5") => {
    switch (mediaType.toLowerCase()) {
      case "call":
        return <Phone className={className} />
      case "email":
        return <Mail className={className} />
      case "message":
        return <MessageSquare className={className} />
      default:
        return <MessageSquare className={className} />
    }
  }

  const getSummaryTypeIcon = (summaryType: string, className = "size-5") => {
    switch (summaryType.toLowerCase()) {
      case "virtualagent":
        return <Bot className={className} />
      case "agent":
        return <User className={className} />
      case "conversation":
        return <Users className={className} />
      default:
        return <MessageSquare className={className} />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "reason":
        return { icon: <AlertCircle className="size-5" />, color: primaryColor, bgColor: hexToRgba(primaryColor, 0.1) }
      case "resolution":
        return { icon: <CheckCircle className="size-5" />, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' }
      case "actionitem":
        return { icon: <ListTodo className="size-5" />, color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' }
      default:
        return { icon: <MessageSquare className="size-5" />, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' }
    }
  }

  const getLocaleString = (locale: string) => {
    const localeMap: Record<string, string> = {
      es: "es-ES",
      en: "en-US",
      fr: "fr-FR",
      nl: "nl-NL",
      it: "it-IT",
      de: "de-DE",
      ar: "ar-SA",
      el: "el-GR",
      pl: "pl-PL",
      pt: "pt-PT",
    }
    return localeMap[locale] || "en-US"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(getLocaleString(locale), {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date)
  }

  const languageMap: Record<string, string> = {
    es: t.spanish,
    en: t.english,
    fr: t.french,
    nl: t.dutch,
    it: t.italian,
    de: t.german,
    ar: t.arabic,
    el: t.greek,
    pl: t.polish,
    pt: t.portuguese,
  }

  const getSummaryTypeLabel = (summaryType: string) => {
    switch (summaryType.toLowerCase()) {
      case "virtualagent":
        return t.virtualAgentBadge
      case "agent":
        return t.agent
      case "conversation":
        return t.conversation
      default:
        return summaryType
    }
  }

  const isExternalLogo = logoUrl.startsWith("http://") || logoUrl.startsWith("https://")

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, ${hexToRgba(primaryColor, 0.08)}, transparent),
            radial-gradient(ellipse 60% 40% at 100% 0%, ${hexToRgba(primaryColor, 0.05)}, transparent),
            radial-gradient(ellipse 50% 30% at 0% 100%, ${hexToRgba(primaryColor, 0.03)}, transparent),
            linear-gradient(180deg, #fafbff 0%, #f8faff 50%, #f5f7ff 100%)
          `
        }}
      />

      {/* Grid Pattern */}
      <div
        className="fixed inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(${primaryColor} 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor} 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: hexToRgba(primaryColor, 0.1)
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, ${primaryColor}, ${adjustBrightness(primaryColor, 30)}, ${primaryColor})`
          }}
        />

        <div className="w-[98%] max-w-[2500px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                {isExternalLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-12 w-auto" />
                ) : (
                  <Image src={logoUrl} alt="Logo" width={280} height={84} className="h-12 w-auto" priority />
                )}
              </div>

              <div
                className="h-8 w-px hidden sm:block"
                style={{
                  background: `linear-gradient(180deg, transparent, ${hexToRgba(primaryColor, 0.3)}, transparent)`
                }}
              />

              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-800">{t.conversationDetails}</h1>
              </div>
            </div>

            <Link href="/">
              <Button
                variant="outline"
                size="default"
                className="gap-2 rounded-xl border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">{t.backToDashboard}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[98%] max-w-[2500px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="space-y-8">
          {/* Summary Card */}
          <Card
            className="relative bg-white/90 backdrop-blur-sm border-0 rounded-3xl overflow-hidden animate-fade-in-up"
            style={{
              boxShadow: `
                0 4px 6px ${hexToRgba(primaryColor, 0.02)},
                0 12px 24px ${hexToRgba(primaryColor, 0.05)},
                0 24px 48px ${hexToRgba(primaryColor, 0.08)}
              `,
              borderLeft: `4px solid ${primaryColor}`
            }}
          >
            {/* Decorative gradient */}
            <div
              className="absolute top-0 right-0 w-96 h-96 opacity-[0.04] pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${primaryColor}, transparent 70%)`
              }}
            />

            <CardHeader className="pb-4 relative">
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <Badge
                  className="gap-1.5 font-bold px-4 py-1.5 rounded-full text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
                    boxShadow: `0 4px 14px ${hexToRgba(primaryColor, 0.4)}`
                  }}
                >
                  {getSummaryTypeIcon(conversation.summary_type, "size-4")}
                  {getSummaryTypeLabel(conversation.summary_type)}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 font-semibold px-3 py-1 rounded-full bg-gray-100">
                  {getMediaIcon(conversation.media_type, "size-4")}
                  {conversation.media_type.toLowerCase() === "call"
                    ? t.call
                    : conversation.media_type.toLowerCase() === "email"
                      ? t.email
                      : conversation.media_type.toLowerCase() === "message"
                        ? t.message
                        : conversation.media_type}
                </Badge>
                <Badge variant="outline" className="font-semibold px-3 py-1 rounded-full border-gray-200">
                  {(languageMap[conversation.language] || conversation.language).toUpperCase()}
                </Badge>
                {conversation.generated && (
                  <Badge
                    className="gap-1.5 shadow-md font-semibold px-3 py-1 rounded-full text-white"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                    }}
                  >
                    <Sparkles className="size-3" />
                    {t.aiGenerated}
                  </Badge>
                )}
              </div>
              <CardTitle
                className="text-2xl lg:text-3xl font-bold text-balance leading-relaxed"
                style={{
                  background: `linear-gradient(135deg, #1a1a2e 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t.conversationSummary}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-gray-700 leading-relaxed text-pretty">{conversation.summary}</p>
            </CardContent>
          </Card>

          {/* Metadata Compact Bar */}
          <Card
            className="group bg-white/80 backdrop-blur-sm border-0 shadow-premium transition-all duration-500 rounded-2xl overflow-hidden animate-fade-in-up"
            style={{ animationDelay: '0.05s' }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.03)} 0%, transparent 60%)` }}
            />
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                {[
                  { icon: Calendar, label: t.dateCreated, value: formatDate(conversation.date_created) },
                  { icon: Globe, label: t.language, value: languageMap[conversation.language] || conversation.language },
                  { icon: Hash, label: t.summaryId, value: conversation.summary_id, mono: true },
                  { icon: Hash, label: t.sourceId, value: conversation.source_id, mono: true },
                  ...(conversation.agent_id ? [{ icon: User, label: t.agentId, value: conversation.agent_id, mono: true }] : []),
                  ...(conversation.conversation_id ? [{ icon: Link2, label: t.conversationIdLabel, value: conversation.conversation_id, mono: true }] : []),
                ].map((item, index) => (
                  <div key={item.label + index} className="flex items-start gap-4">
                    <div
                      className="size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500"
                      style={{
                        background: hexToRgba(primaryColor, 0.08),
                        color: primaryColor
                      }}
                    >
                      <item.icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
                      <p className={`text-sm text-gray-800 ${item.mono ? 'font-mono break-all text-xs' : 'font-medium'}`}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Child Summaries */}
          {childSummaries.length > 0 && (
            <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="flex items-center gap-3">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t.childSummaries.charAt(0).toUpperCase() + t.childSummaries.slice(1)}
                </h2>
                <Badge
                  className="font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: hexToRgba(primaryColor, 0.1),
                    color: primaryColor
                  }}
                >
                  {childSummaries.length}
                </Badge>
              </div>

              <div className="space-y-3 pl-4 relative">
                <div
                  className="absolute left-2 top-0 bottom-0 w-[2px] rounded-full"
                  style={{ background: `linear-gradient(180deg, ${hexToRgba(primaryColor, 0.3)}, ${hexToRgba(primaryColor, 0.05)})` }}
                />

                {childSummaries.map((child, index) => (
                  <Link key={child.id} href={`/conversation/${child.id}`}>
                    <Card
                      className="group bg-white/80 backdrop-blur-sm border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1 cursor-pointer ml-4"
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: primaryColor,
                        animationDelay: `${0.4 + index * 0.05}s`
                      }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="gap-1 font-semibold px-2.5 py-0.5 rounded-full text-sm"
                                style={{ borderColor: hexToRgba(primaryColor, 0.3), color: primaryColor }}
                              >
                                {getSummaryTypeIcon(child.summary_type, "size-3.5")}
                                {getSummaryTypeLabel(child.summary_type)}
                              </Badge>
                              <Badge variant="secondary" className="gap-1 font-semibold px-2.5 py-0.5 rounded-full text-sm bg-gray-100">
                                {getMediaIcon(child.media_type, "size-3.5")}
                              </Badge>
                            </div>
                            <CardTitle className="text-base font-bold line-clamp-2 text-gray-800 group-hover:text-gray-900">
                              {child.summary}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 flex items-center gap-1.5">
                              <span className="size-1.5 rounded-full" style={{ background: primaryColor }} />
                              {formatDate(child.date_created)}
                            </CardDescription>
                          </div>
                          <ChevronRight className="size-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-3">
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t.insights}
                </h2>
                <Badge
                  className="gap-1 font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: hexToRgba(primaryColor, 0.1),
                    color: primaryColor
                  }}
                >
                  <Sparkles className="size-3" />
                  {insights.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {insights.map((insight, index) => {
                  const insightStyle = getInsightIcon(insight.type)
                  return (
                    <Card
                      key={insight.id}
                      className="group bg-white/80 backdrop-blur-sm border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1"
                      style={{
                        borderLeftWidth: 4,
                        borderLeftColor: insightStyle.color,
                        animationDelay: `${0.45 + index * 0.05}s`
                      }}
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div
                            className="size-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: insightStyle.bgColor, color: insightStyle.color }}
                          >
                            {insightStyle.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="font-semibold px-3 py-1 rounded-full"
                                style={{ borderColor: insightStyle.color, color: insightStyle.color }}
                              >
                                {insight.type.toLowerCase() === "reason"
                                  ? t.reason
                                  : insight.type.toLowerCase() === "resolution"
                                    ? t.resolution
                                    : insight.type.toLowerCase() === "actionitem"
                                      ? t.actionItem
                                      : insight.type}
                              </Badge>
                              {insight.outcome && (
                                <Badge variant="secondary" className="font-semibold px-3 py-1 rounded-full">
                                  {insight.outcome}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg font-bold mb-2 text-balance text-gray-800">
                              {insight.title}
                            </CardTitle>
                            <CardDescription className="text-base text-pretty leading-relaxed text-gray-600">
                              {insight.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>


    </div>
  )
}
