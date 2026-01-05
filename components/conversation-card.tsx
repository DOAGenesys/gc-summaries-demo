"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, MessageSquare, Phone, Mail, Bot, User, Users, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DeleteButton } from "@/components/delete-button"
import type { ConversationRow, GroupedConversation } from "@/lib/types"

interface ConversationCardProps {
    conversation: ConversationRow
    isChild?: boolean
    locale: string
    translations: {
        agent: string
        virtualAgentBadge: string
        conversation: string
        call: string
        email: string
        message: string
        insight: string
        insightPlural: string
        childSummaries: string
        childSummary: string
        showChildren: string
        hideChildren: string
        delete: string
        deleteConfirmTitle: string
        deleteConfirmDescription: string
        deleteParentWarning: string
        cancel: string
        confirm: string
        deleting: string
    }
    primaryColor: string
    hasChildren?: boolean
}

interface GroupedConversationCardProps {
    group: GroupedConversation
    locale: string
    translations: ConversationCardProps["translations"]
    primaryColor: string
}

// Date formatting function (moved to client component)
function formatDate(dateString: string, locale: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
}

function getMediaIcon(mediaType: string, className = "size-4") {
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

function getSummaryTypeIcon(summaryType: string, className = "size-4") {
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

function getSummaryTypeLabel(summaryType: string, translations: ConversationCardProps["translations"]) {
    switch (summaryType.toLowerCase()) {
        case "virtualagent":
            return translations.virtualAgentBadge
        case "agent":
            return translations.agent
        case "conversation":
            return translations.conversation
        default:
            return summaryType
    }
}

// Helper to adjust color brightness
function adjustBrightness(hex: string, percent: number): string {
    const cleanHex = hex.replace("#", "")
    const num = parseInt(cleanHex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + percent))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent))
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

// Helper to create rgba from hex
function hexToRgba(hex: string, alpha: number): string {
    const cleanHex = hex.replace("#", "")
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function ConversationCard({
    conversation,
    isChild = false,
    locale,
    translations,
    primaryColor,
    hasChildren = false,
}: ConversationCardProps) {
    const deleteLabels = {
        delete: translations.delete,
        deleteConfirmTitle: translations.deleteConfirmTitle,
        deleteConfirmDescription: translations.deleteConfirmDescription,
        deleteParentWarning: translations.deleteParentWarning,
        cancel: translations.cancel,
        confirm: translations.confirm,
        deleting: translations.deleting,
    }

    return (
        <Card
            className={`group relative bg-white/95 backdrop-blur-sm border border-gray-100/80 shadow-premium hover:shadow-premium-lg transition-all duration-500 cursor-pointer rounded-2xl overflow-hidden ${isChild ? "ml-8" : ""}`}
            style={{
                borderLeftWidth: isChild ? 4 : 1,
                borderLeftColor: isChild ? primaryColor : undefined,
            }}
        >
            {/* Hover gradient overlay */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.02)} 0%, transparent 50%)`
                }}
            />

            {/* Top accent line on hover */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500"
                style={{
                    background: `linear-gradient(90deg, ${primaryColor}, ${adjustBrightness(primaryColor, 40)}, ${primaryColor})`
                }}
            />

            <CardHeader className="pb-4 relative">
                <div className="flex items-start justify-between gap-4">
                    <Link href={`/conversation/${conversation.id}`} className="flex-1 min-w-0 group-hover:-translate-y-0.5 transition-transform duration-300">
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            {/* Summary Type Badge */}
                            <Badge
                                variant="outline"
                                className="gap-1.5 font-semibold px-3 py-1 rounded-full transition-all duration-300 group-hover:shadow-sm"
                                style={{
                                    borderColor: hexToRgba(primaryColor, 0.3),
                                    color: primaryColor,
                                    background: hexToRgba(primaryColor, 0.05)
                                }}
                            >
                                {getSummaryTypeIcon(conversation.summary_type)}
                                {getSummaryTypeLabel(conversation.summary_type, translations)}
                            </Badge>

                            {/* Media Type Badge */}
                            <Badge variant="secondary" className="gap-1.5 font-semibold px-3 py-1 rounded-full bg-gray-100/80">
                                {getMediaIcon(conversation.media_type)}
                                {conversation.media_type.toLowerCase() === "call"
                                    ? translations.call
                                    : conversation.media_type.toLowerCase() === "email"
                                        ? translations.email
                                        : conversation.media_type.toLowerCase() === "message"
                                            ? translations.message
                                            : conversation.media_type}
                            </Badge>

                            {/* Language Badge */}
                            <Badge variant="outline" className="font-semibold px-3 py-1 rounded-full border-gray-200">
                                {conversation.language.toUpperCase()}
                            </Badge>

                            {/* Insights Badge */}
                            {conversation.insight_count && Number.parseInt(conversation.insight_count) > 0 && (
                                <Badge
                                    className="gap-1.5 shadow-md font-semibold px-3 py-1 rounded-full text-white"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                                        boxShadow: `0 4px 14px ${hexToRgba(primaryColor, 0.35)}`
                                    }}
                                >
                                    <Sparkles className="size-3" />
                                    {conversation.insight_count}{" "}
                                    {Number.parseInt(conversation.insight_count) === 1 ? translations.insight : translations.insightPlural}
                                </Badge>
                            )}
                        </div>

                        {/* Summary Text */}
                        <CardTitle className="text-lg font-bold mb-2 line-clamp-2 text-balance leading-relaxed text-gray-800 group-hover:text-gray-900 transition-colors">
                            {conversation.summary}
                        </CardTitle>

                        {/* Metadata */}
                        <CardDescription className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full" style={{ background: primaryColor }} />
                                {formatDate(conversation.date_created, locale)}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="font-mono text-xs text-gray-400">
                                {conversation.summary_id.slice(0, 8)}...
                            </span>
                        </CardDescription>
                    </Link>

                    {/* Delete Button */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" onClick={(e) => e.preventDefault()}>
                        <DeleteButton
                            id={conversation.id}
                            summaryType={conversation.summary_type}
                            hasChildren={hasChildren}
                            labels={deleteLabels}
                        />
                    </div>
                </div>
            </CardHeader>
        </Card>
    )
}

export function GroupedConversationCard({
    group,
    locale,
    translations,
    primaryColor,
}: GroupedConversationCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const hasChildren = group.children.length > 0

    const deleteLabels = {
        delete: translations.delete,
        deleteConfirmTitle: translations.deleteConfirmTitle,
        deleteConfirmDescription: translations.deleteConfirmDescription,
        deleteParentWarning: translations.deleteParentWarning,
        cancel: translations.cancel,
        confirm: translations.confirm,
        deleting: translations.deleting,
    }

    return (
        <div className="space-y-3">
            <Card
                className="group relative bg-white/95 backdrop-blur-sm border border-gray-100/80 shadow-premium hover:shadow-premium-lg transition-all duration-500 rounded-2xl overflow-hidden"
                style={{
                    borderLeftWidth: 4,
                    borderLeftColor: primaryColor,
                }}
            >
                {/* Decorative background pattern */}
                <div
                    className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at top right, ${primaryColor}, transparent 70%)`
                    }}
                />

                {/* Hover gradient overlay */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                        background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.03)} 0%, transparent 60%)`
                    }}
                />

                <CardHeader className="pb-4 relative">
                    <div className="flex items-start justify-between gap-4">
                        <Link href={`/conversation/${group.parent.id}`} className="flex-1 min-w-0 cursor-pointer">
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                {/* Parent Conversation Badge - Prominent styling */}
                                <Badge
                                    className="gap-1.5 font-bold px-4 py-1.5 rounded-full text-white shadow-lg"
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -20)} 100%)`,
                                        boxShadow: `0 4px 14px ${hexToRgba(primaryColor, 0.4)}`
                                    }}
                                >
                                    {getSummaryTypeIcon(group.parent.summary_type)}
                                    {getSummaryTypeLabel(group.parent.summary_type, translations)}
                                </Badge>

                                {/* Media Type Badge */}
                                <Badge variant="secondary" className="gap-1.5 font-semibold px-3 py-1 rounded-full bg-gray-100/80">
                                    {getMediaIcon(group.parent.media_type)}
                                    {group.parent.media_type.toLowerCase() === "call"
                                        ? translations.call
                                        : group.parent.media_type.toLowerCase() === "email"
                                            ? translations.email
                                            : group.parent.media_type.toLowerCase() === "message"
                                                ? translations.message
                                                : group.parent.media_type}
                                </Badge>

                                {/* Language Badge */}
                                <Badge variant="outline" className="font-semibold px-3 py-1 rounded-full border-gray-200">
                                    {group.parent.language.toUpperCase()}
                                </Badge>

                                {/* Insights Badge */}
                                {group.parent.insight_count && Number.parseInt(group.parent.insight_count) > 0 && (
                                    <Badge
                                        className="gap-1.5 shadow-md font-semibold px-3 py-1 rounded-full text-white"
                                        style={{
                                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -25)} 100%)`,
                                            boxShadow: `0 4px 14px ${hexToRgba(primaryColor, 0.35)}`
                                        }}
                                    >
                                        <Sparkles className="size-3" />
                                        {group.parent.insight_count}{" "}
                                        {Number.parseInt(group.parent.insight_count) === 1 ? translations.insight : translations.insightPlural}
                                    </Badge>
                                )}

                                {/* Children count badge */}
                                {hasChildren && (
                                    <Badge
                                        variant="outline"
                                        className="font-semibold px-3 py-1 rounded-full"
                                        style={{
                                            borderColor: hexToRgba(primaryColor, 0.3),
                                            color: primaryColor,
                                            background: hexToRgba(primaryColor, 0.05)
                                        }}
                                    >
                                        {group.children.length} {group.children.length === 1 ? translations.childSummary : translations.childSummaries}
                                    </Badge>
                                )}
                            </div>

                            {/* Summary Text */}
                            <CardTitle className="text-xl font-bold mb-3 line-clamp-2 text-balance leading-relaxed text-gray-800 group-hover:text-gray-900 transition-colors">
                                {group.parent.summary}
                            </CardTitle>

                            {/* Metadata */}
                            <CardDescription className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="size-1.5 rounded-full animate-pulse" style={{ background: primaryColor }} />
                                    {formatDate(group.parent.date_created, locale)}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="font-mono text-xs text-gray-400">
                                    {group.parent.summary_id.slice(0, 8)}...
                                </span>
                            </CardDescription>
                        </Link>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {hasChildren && (
                                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-300"
                                            title={isOpen ? translations.hideChildren : translations.showChildren}
                                        >
                                            <div className="transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                <ChevronDown className="size-5" />
                                            </div>
                                        </Button>
                                    </CollapsibleTrigger>
                                </Collapsible>
                            )}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <DeleteButton
                                    id={group.parent.id}
                                    summaryType={group.parent.summary_type}
                                    hasChildren={hasChildren}
                                    labels={deleteLabels}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Collapsible Children */}
            {hasChildren && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <CollapsibleContent className="space-y-3 pl-4 relative">
                        {/* Connecting line */}
                        <div
                            className="absolute left-6 top-0 bottom-4 w-[2px] rounded-full"
                            style={{ background: `linear-gradient(180deg, ${hexToRgba(primaryColor, 0.3)}, ${hexToRgba(primaryColor, 0.05)})` }}
                        />

                        {group.children.map((child, index) => (
                            <div
                                key={child.id}
                                className="animate-fade-in-up"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <ConversationCard
                                    conversation={child}
                                    isChild
                                    locale={locale}
                                    translations={translations}
                                    primaryColor={primaryColor}
                                />
                            </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            )}
        </div>
    )
}
