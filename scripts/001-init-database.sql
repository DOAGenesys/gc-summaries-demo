-- Create conversations table to store all conversation summaries
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  summary_type VARCHAR(50) NOT NULL,
  media_type VARCHAR(50) NOT NULL,
  language VARCHAR(10) NOT NULL,
  summary_id VARCHAR(255) UNIQUE NOT NULL,
  agent_id VARCHAR(255),
  source_id VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  generated BOOLEAN DEFAULT true,
  date_created TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create insights table to store conversation insights
CREATE TABLE IF NOT EXISTS insights (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  outcome VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_conversations_summary_type ON conversations(summary_type);
CREATE INDEX IF NOT EXISTS idx_conversations_date_created ON conversations(date_created DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_summary_id ON conversations(summary_id);
CREATE INDEX IF NOT EXISTS idx_insights_conversation_id ON insights(conversation_id);
