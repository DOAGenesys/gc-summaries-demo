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
      // Insert conversation
      const conversationResult = await sql`
        INSERT INTO conversations (
          summary_type, media_type, language, summary_id, agent_id, 
          source_id, summary, generated, date_created
        ) VALUES (
          ${entity.summaryType}, 
          ${entity.mediaType}, 
          ${entity.language}, 
          ${entity.summaryId}, 
          ${entity.agentId || null}, 
          ${entity.sourceId}, 
          ${entity.summary}, 
          ${entity.generated}, 
          ${entity.dateCreated}
        )
        RETURNING id
      `

      const conversationId = conversationResult[0].id

      // Insert insights if present
      if (entity.insights && Array.isArray(entity.insights)) {
        for (const insight of entity.insights) {
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
