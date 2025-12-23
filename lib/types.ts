export interface Insight {
  type: string
  title: string
  description: string
  outcome?: string
}

export interface ConversationSummary {
  summaryType: string
  mediaType: string
  language: string
  summaryId: string
  agentId?: string
  sourceId: string
  summary: string
  generated: boolean
  dateCreated: string
  insights?: Insight[]
}

export interface ConversationApiRequest {
  entities: ConversationSummary[]
}

export interface ConversationRecord extends ConversationSummary {
  id: number
  createdAt: string
}
