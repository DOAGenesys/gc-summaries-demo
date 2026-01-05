export interface Insight {
  type: string
  title: string
  description: string
  outcome?: string
}

export type SummaryType = "Agent" | "VirtualAgent" | "Conversation"

export interface ConversationSummary {
  summaryType: SummaryType
  mediaType: string
  language: string
  summaryId: string
  agentId?: string
  sourceId: string
  summary: string
  generated: boolean
  dateCreated: string
  conversationId?: string  // Groups summaries together; required for Agent/VirtualAgent
  insights?: Insight[]
}

export interface ConversationApiRequest {
  entities: ConversationSummary[]
}

export interface ConversationRecord extends ConversationSummary {
  id: number
  createdAt: string
}

// Database row types
export interface ConversationRow {
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
  conversation_id: string | null
  insight_count?: string
}

export interface InsightRow {
  id: number
  type: string
  title: string
  description: string
  outcome: string | null
}

// Grouped conversation structure for UI
export interface GroupedConversation {
  parent: ConversationRow
  children: ConversationRow[]
}
