import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { getLocale } from "@/lib/locale"
import { getTranslations } from "@/lib/i18n"
import { getLogoUrl, getPrimaryColor } from "@/lib/env"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, MessageSquare, Bot, User, Users, Sparkles, TrendingUp } from "lucide-react"
import Image from "next/image"
import { logout } from "@/app/actions/auth"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ConversationCard, GroupedConversationCard, SharedConversationGroup } from "@/components/conversation-card"
import type { ConversationRow, GroupedConversation } from "@/lib/types"

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

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  // Get environment-based config
  const logoUrl = getLogoUrl()
  const primaryColor = getPrimaryColor()

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

  // Group conversations: Conversation types are parents, Agent/VirtualAgent are children
  const groupedConversations: GroupedConversation[] = []
  const sharedConversations: ConversationRow[][] = []
  const standaloneConversations: ConversationRow[] = []

  const convMap = new Map<string, ConversationRow[]>()

  // First pass: Bucket by conversation_id
  for (const conv of conversations) {
    if (conv.conversation_id) {
      const list = convMap.get(conv.conversation_id) || []
      list.push(conv)
      convMap.set(conv.conversation_id, list)
    } else {
      standaloneConversations.push(conv)
    }
  }

  // Second pass: Process groups
  for (const list of convMap.values()) {
    // Check if there is a 'Conversation' type summary which acts as the explicit parent
    const parentIndex = list.findIndex(c => c.summary_type === "Conversation")

    if (parentIndex !== -1) {
      // Standard Parent-Child relationship
      const parent = list[parentIndex]
      const children = list.filter((_, idx) => idx !== parentIndex)

      groupedConversations.push({
        parent,
        children: children.sort((a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()),
      })
    } else {
      // No explicit parent 'Conversation' summary
      if (list.length > 1) {
        // Shared Parentship: Multiple summaries sharing the same ID but no main parent
        sharedConversations.push(list.sort((a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()))
      } else {
        // Orphan with specific ID but no siblings -> Treat as standalone
        standaloneConversations.push(list[0])
      }
    }
  }

  // Sort groups by latest activity
  groupedConversations.sort((a, b) => new Date(b.parent.date_created).getTime() - new Date(a.parent.date_created).getTime())
  sharedConversations.sort((a, b) => {
    const dateA = a[0] ? new Date(a[0].date_created).getTime() : 0;
    const dateB = b[0] ? new Date(b[0].date_created).getTime() : 0;
    return dateB - dateA;
  })
  standaloneConversations.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())

  // Count statistics
  const totalCount = conversations.length
  const agentCount = conversations.filter((c) => c.summary_type === "Agent").length
  const virtualAgentCount = conversations.filter((c) => c.summary_type === "VirtualAgent").length
  const conversationCount = conversations.filter((c) => c.summary_type === "Conversation").length

  const cardTranslations = {
    agent: t.agent,
    virtualAgentBadge: t.virtualAgentBadge,
    conversation: t.conversation,
    call: t.call,
    email: t.email,
    message: t.message,
    insight: t.insight,
    insightPlural: t.insightPlural,
    childSummaries: t.childSummaries,
    childSummary: t.childSummary,
    showChildren: t.showChildren,
    hideChildren: t.hideChildren,
    delete: t.delete,
    deleteConfirmTitle: t.deleteConfirmTitle,
    deleteConfirmDescription: t.deleteConfirmDescription,
    deleteParentWarning: t.deleteParentWarning,
    cancel: t.cancel,
    confirm: t.confirm,
    deleting: t.deleting,
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

      {/* Decorative Grid Pattern */}
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
        {/* Top accent line */}
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
                  <img src={logoUrl} alt="Logo" className="h-16 w-auto" />
                ) : (
                  <Image src={logoUrl} alt="Logo" width={280} height={84} className="h-16 w-auto" priority />
                )}
              </div>

              {/* Divider */}
              <div
                className="h-10 w-px hidden sm:block"
                style={{
                  background: `linear-gradient(180deg, transparent, ${hexToRgba(primaryColor, 0.3)}, transparent)`
                }}
              />

              <div className="hidden sm:block">
                <h1
                  className="text-xl font-bold"
                  style={{
                    background: `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor} 50%, #1a1a2e 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {t.appTitle}
                </h1>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{t.analyticsPlatform}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={locale} primaryColor={primaryColor} />
              <form action={logout}>
                <Button
                  variant="outline"
                  size="default"
                  className="gap-2 rounded-xl border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <LogOut className="size-4" />
                  <span className="hidden sm:inline">{t.signOut}</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-[98%] max-w-[2500px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {/* Total Card */}
          <Card
            className="group relative bg-white/80 backdrop-blur-sm border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.05)} 0%, transparent 60%)` }}
            />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.totalConversations}</p>
                  <p
                    className="text-4xl lg:text-5xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -30)} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {totalCount}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="size-3" style={{ color: primaryColor }} />
                    <span className="text-xs font-medium" style={{ color: primaryColor }}>{t.active}</span>
                  </div>
                </div>
                <div
                  className="size-12 lg:size-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                    boxShadow: `0 8px 24px ${hexToRgba(primaryColor, 0.35)}`
                  }}
                >
                  <MessageSquare className="size-6 lg:size-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversation Summaries Card */}
          <Card
            className="group relative bg-white/80 backdrop-blur-sm border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.05)} 0%, transparent 60%)` }}
            />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.conversationSummaries}</p>
                  <p
                    className="text-4xl lg:text-5xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -30)} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {conversationCount}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-2">{t.parentSummaries}</p>
                </div>
                <div
                  className="size-12 lg:size-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                    boxShadow: `0 8px 24px ${hexToRgba(primaryColor, 0.35)}`
                  }}
                >
                  <Users className="size-6 lg:size-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Summaries Card */}
          <Card
            className="group relative bg-white/80 backdrop-blur-sm border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.05)} 0%, transparent 60%)` }}
            />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.agentSummaries}</p>
                  <p
                    className="text-4xl lg:text-5xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -30)} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {agentCount}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-2">{t.humanAgents}</p>
                </div>
                <div
                  className="size-12 lg:size-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                    boxShadow: `0 8px 24px ${hexToRgba(primaryColor, 0.35)}`
                  }}
                >
                  <User className="size-6 lg:size-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Virtual Agent Card */}
          <Card
            className="group relative bg-white/80 backdrop-blur-sm border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-1"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.05)} 0%, transparent 60%)` }}
            />
            <CardContent className="pt-6 pb-5 relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t.virtualAgent}</p>
                  <p
                    className="text-4xl lg:text-5xl font-black"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -30)} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {virtualAgentCount}
                  </p>
                  <p className="text-xs text-gray-400 font-medium mt-2">{t.aiAssistants}</p>
                </div>
                <div
                  className="size-12 lg:size-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                    boxShadow: `0 8px 24px ${hexToRgba(primaryColor, 0.35)}`
                  }}
                >
                  <Bot className="size-6 lg:size-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-2xl lg:text-3xl font-bold"
                style={{
                  background: `linear-gradient(135deg, #1a1a2e 0%, ${primaryColor} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {t.recentConversations}
              </h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {t.manageConversations}
              </p>
            </div>
            <div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: hexToRgba(primaryColor, 0.08),
                color: primaryColor
              }}
            >
              <Sparkles className="size-4" />
              {totalCount} {t.total}
            </div>
          </div>

          {totalCount === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-premium rounded-3xl overflow-hidden">
              <CardContent className="py-20 text-center">
                <div
                  className="size-24 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float"
                  style={{
                    background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.1)} 0%, ${hexToRgba(primaryColor, 0.05)} 100%)`,
                  }}
                >
                  <MessageSquare className="size-12" style={{ color: primaryColor }} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{t.noConversations}</h3>
                <p className="text-base text-gray-500 max-w-md mx-auto">{t.noConversationsDescription}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Grouped Conversations */}
              {groupedConversations.map((group, index) => (
                <div
                  key={group.parent.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <GroupedConversationCard
                    group={group}
                    locale={locale}
                    translations={cardTranslations}
                    primaryColor={primaryColor}
                  />
                </div>
              ))}

              {/* Shared Conversation Groups (Orphans with same Conversation ID) */}
              {sharedConversations.map((group, index) => (
                <div
                  key={`shared-${index}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(groupedConversations.length + index) * 0.05}s` }}
                >
                  <SharedConversationGroup
                    conversations={group}
                    locale={locale}
                    translations={cardTranslations}
                    primaryColor={primaryColor}
                  />
                </div>
              ))}

              {/* Standalone Conversations */}
              {standaloneConversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${(groupedConversations.length + sharedConversations.length + index) * 0.05}s` }}
                >
                  <ConversationCard
                    conversation={conversation}
                    locale={locale}
                    translations={cardTranslations}
                    primaryColor={primaryColor}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>


    </div>
  )
}
