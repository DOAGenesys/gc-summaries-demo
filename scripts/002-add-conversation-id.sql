-- Migration script to add conversation_id column to existing databases
-- Run this if you already have an existing database

-- Add the conversation_id column if it doesn't exist
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS conversation_id VARCHAR(255);

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
