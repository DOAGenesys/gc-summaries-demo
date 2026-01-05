import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { ConversationApiRequest } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Validate API key
    const apiKey = request.headers.get("x-api-key")
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = (await request.json()) as ConversationApiRequest

    if (!body.entities || !Array.isArray(body.entities)) {
      return NextResponse.json({ error: "Invalid request format. Expected { entities: [...] }" }, { status: 400 })
    }

    const insertedConversations = []

    // Process each entity
    for (const entity of body.entities) {
      // Validate conversationId for child summaries
      if ((entity.summaryType === "Agent" || entity.summaryType === "VirtualAgent") && !entity.conversationId) {
        return NextResponse.json(
          { error: `conversationId is required for summaryType "${entity.summaryType}"` },
          { status: 400 }
        )
      }

      // Insert conversation
      const conversationResult = await sql`
        INSERT INTO conversations (
          summary_type, media_type, language, summary_id, agent_id, 
          source_id, summary, generated, date_created, conversation_id
        ) VALUES (
          ${entity.summaryType}, 
          ${entity.mediaType}, 
          ${entity.language}, 
          ${entity.summaryId}, 
          ${entity.agentId || null}, 
          ${entity.sourceId}, 
          ${entity.summary}, 
          ${entity.generated}, 
          ${entity.dateCreated},
          ${entity.conversationId || null}
        )
        RETURNING id
      `

      const conversationId = conversationResult[0].id

      // Insert insights if present (supports both array and stringified JSON for Genesys Data Actions)
      let insightsArray = entity.insights

      // If insights is a string, try to parse it as JSON
      if (typeof insightsArray === 'string') {
        try {
          insightsArray = JSON.parse(insightsArray)
        } catch {
          console.warn('[API] Failed to parse insights string as JSON:', insightsArray)
          insightsArray = undefined
        }
      }

      if (insightsArray && Array.isArray(insightsArray)) {
        for (const insight of insightsArray) {
          await sql`
            INSERT INTO insights (
              conversation_id, type, title, description, outcome
            ) VALUES (
              ${conversationId}, 
              ${insight.type}, 
              ${insight.title}, 
              ${insight.description}, 
              ${insight.outcome || null}
            )
          `
        }
      }

      insertedConversations.push({
        id: conversationId,
        summaryId: entity.summaryId,
      })
    }

    return NextResponse.json({
      success: true,
      inserted: insertedConversations.length,
      conversations: insertedConversations,
    })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
