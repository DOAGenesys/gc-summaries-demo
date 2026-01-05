"use server"

import { revalidatePath } from "next/cache"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function deleteConversation(id: number): Promise<{ success: boolean; error?: string }> {
    const session = await getSession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        // First, get the conversation to check its type and conversation_id
        const conversation = await sql`
      SELECT id, summary_type, summary_id FROM conversations WHERE id = ${id}
    `

        if (conversation.length === 0) {
            return { success: false, error: "Conversation not found" }
        }

        const conv = conversation[0]

        // If this is a "Conversation" (parent) type, also delete all children with the same summary_id as conversation_id
        if (conv.summary_type === "Conversation") {
            // Delete children first (those that have this summary_id as their conversation_id)
            await sql`
        DELETE FROM conversations WHERE conversation_id = ${conv.summary_id}
      `
        }

        // Delete the conversation itself (insights are deleted via CASCADE)
        await sql`
      DELETE FROM conversations WHERE id = ${id}
    `

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Error deleting conversation:", error)
        return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}

export async function deleteMultipleConversations(ids: number[]): Promise<{ success: boolean; deleted: number; error?: string }> {
    const session = await getSession()
    if (!session) {
        return { success: false, deleted: 0, error: "Unauthorized" }
    }

    try {
        let deletedCount = 0

        for (const id of ids) {
            const result = await deleteConversation(id)
            if (result.success) {
                deletedCount++
            }
        }

        revalidatePath("/")
        return { success: true, deleted: deletedCount }
    } catch (error) {
        console.error("Error deleting conversations:", error)
        return { success: false, deleted: 0, error: error instanceof Error ? error.message : "Unknown error" }
    }
}
