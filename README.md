# Movistar Conversation Analytics Platform

A secure, modern Next.js app for visualizing and analyzing conversation summaries with AI-powered insights. Built with Next.js 16, TypeScript, and Neon Postgres.

## Features

- **Secure Authentication**: Username/password login with HTTP-only session cookies
- **REST API**: POST endpoint to ingest conversation data with API key authentication
- **Database Storage**: Postgres database via Neon for persistent data storage
- **Modern UI**: Clean, professional interface with Movistar branding
- **Responsive Design**: Fully responsive design that works on all devices
- **Detailed Views**: Click any conversation to see full details and insights
- **Real-time Stats**: Dashboard with conversation statistics and metrics

## Tech Stack

- **Framework**: Next.js 16.1 (App Router, Server Components, Server Actions)
- **Language**: TypeScript
- **Database**: Neon Postgres with `@neondatabase/serverless`
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components built with Radix UI primitives
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- A Neon Postgres database
- Vercel account (for deployment)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL=your_neon_database_connection_string

# Authentication
USERNAME=your_admin_username
PASSWORD=your_admin_password

# API Security
API_KEY=your_secure_api_key
```

## Database Setup

### 1. Create the Database Tables

Run the following SQL commands in your Neon database console or SQL editor:

```sql
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
```

### 2. Verify Tables

Verify the tables were created successfully:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check conversations table structure
\d conversations

-- Check insights table structure
\d insights
```

## Installation

1. **Clone or download the project**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see above)

4. **Run database setup** (see Database Setup section)

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## API Documentation

### POST /api/conversations

Ingests new conversation summaries into the system.

**Headers:**
```
x-api-key: your_api_key
Content-Type: application/json
```

**Request Body:**
```json
{
  "entities": [
    {
      "summaryType": "Agent",
      "mediaType": "Call",
      "language": "es",
      "summaryId": "a8c57610-a162-3aff-9c23-8d83c930aa5e",
      "agentId": "b7f09b48-a686-4690-b2d4-b9e4e3b554d9",
      "sourceId": "5827d8b9-2223-4376-a191-b3d4fbec752f",
      "summary": "Customer contacted regarding Movistar Fusion package details...",
      "generated": true,
      "dateCreated": "2025-12-18T15:12:59.690Z"
    }
  ]
}
```

**Response (Success):**
```json
{
  "success": true,
  "inserted": 1,
  "conversations": [
    {
      "id": 123,
      "summaryId": "a8c57610-a162-3aff-9c23-8d83c930aa5e"
    }
  ]
}
```

**Response (Unauthorized):**
```json
{
  "error": "Unauthorized"
}
```

### Example with Insights

```json
{
  "entities": [
    {
      "summaryType": "Conversation",
      "mediaType": "Call",
      "language": "es",
      "summaryId": "2055a9b1-9bd1-429d-b2f9-81d34eeb7754",
      "sourceId": "cfabd884-161b-4de6-a014-fe202d9bb2c7",
      "summary": "Customer inquiry about Movistar Fusion package...",
      "generated": true,
      "dateCreated": "2025-12-18T15:13:30.457Z",
      "insights": [
        {
          "type": "Reason",
          "title": "Information about Movistar Fusion package",
          "description": "Customer wants to know the details of the package..."
        },
        {
          "type": "Resolution",
          "title": "Missing information",
          "description": "Customer still has questions about specific details...",
          "outcome": "Partially resolved"
        },
        {
          "type": "ActionItem",
          "title": "Follow-up needed",
          "description": "Agent should provide detailed information..."
        }
      ]
    }
  ]
}
```

### cURL Examples

**Post a conversation without insights:**
```bash
curl -X POST https://your-app.vercel.app/api/conversations \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      {
        "summaryType": "Agent",
        "mediaType": "Call",
        "language": "en",
        "summaryId": "574a8923-10b8-3541-ab89-9a01092f445e",
        "agentId": "f6b913a4-724e-4420-9f25-a61ad5dcaeb1",
        "sourceId": "05181508-9c0a-455b-8caf-130c66ef8b2f",
        "summary": "Customer inquired about appointment time. Agent confirmed 8:00 AM.",
        "generated": true,
        "dateCreated": "2025-12-23T10:36:52.718Z"
      }
    ]
  }'
```

**Post multiple conversations:**
```bash
curl -X POST https://your-app.vercel.app/api/conversations \
  -H "x-api-key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      {
        "summaryType": "Agent",
        "mediaType": "Call",
        "language": "es",
        "summaryId": "uuid-1",
        "sourceId": "source-1",
        "summary": "First conversation...",
        "generated": true,
        "dateCreated": "2025-12-23T10:00:00.000Z"
      },
      {
        "summaryType": "VirtualAgent",
        "mediaType": "Message",
        "language": "en",
        "summaryId": "uuid-2",
        "sourceId": "source-2",
        "summary": "Second conversation...",
        "generated": true,
        "dateCreated": "2025-12-23T11:00:00.000Z"
      }
    ]
  }'
```

## Data Schema

### Conversation Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `summaryType` | string | Yes | Type of summary: `Conversation`, `Agent`, or `VirtualAgent` |
| `mediaType` | string | Yes | Media type: `Call`, `Email`, `Message`, or `Unknown` |
| `language` | string | Yes | Language code (e.g., `es`, `en`) |
| `summaryId` | string | Yes | Unique identifier for the summary |
| `agentId` | string | No | Agent identifier (only for Agent summaries) |
| `sourceId` | string | Yes | Source program/flow identifier |
| `summary` | string | Yes | Summary text of the conversation |
| `generated` | boolean | Yes | Whether summary was AI-generated |
| `dateCreated` | string | Yes | ISO-8601 timestamp |
| `insights` | array | No | Array of insight objects |

### Insight Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Insight type: `Reason`, `Resolution`, or `ActionItem` |
| `title` | string | Yes | Insight title |
| `description` | string | Yes | Detailed description |
| `outcome` | string | No | Resolution outcome (for Resolution type) |

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add environment variables** in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL`, `USERNAME`, `PASSWORD`, and `API_KEY`

4. **Deploy**:
   - Vercel will automatically deploy your app
   - Your app will be available at `https://your-app.vercel.app`

## Security Features

- **Authentication**: Secure login with HTTP-only cookies
- **API Authentication**: API key validation for all POST requests
- **Session Management**: Server-side session handling
- **SQL Injection Prevention**: Parameterized queries with Neon driver
- **Environment Variables**: Sensitive data stored securely
- **HTTPS**: Automatic HTTPS on Vercel

## Project Structure

```
├── app/
│   ├── actions/
│   │   └── auth.ts              # Server actions for auth
│   ├── api/
│   │   └── conversations/
│   │       └── route.ts         # API endpoint
│   ├── conversation/
│   │   └── [id]/
│   │       └── page.tsx         # Detail view
│   ├── login/
│   │   └── page.tsx             # Login page
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Dashboard
├── components/
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── auth.ts                  # Auth utilities
│   ├── db.ts                    # Database client
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
├── public/
│   └── movistar-logo.png        # Movistar logo
├── scripts/
│   └── 001-init-database.sql   # Database initialization
└── README.md                    # This file
```

## Troubleshooting

### Cannot connect to database
- Verify `DATABASE_URL` is correct in `.env.local`
- Check that your Neon database is running
- Ensure IP allowlisting is configured in Neon (if applicable)

### Authentication not working
- Verify `USERNAME` and `PASSWORD` are set in environment variables
- Clear browser cookies and try again
- Check that cookies are enabled in your browser

### API returns 401 Unauthorized
- Verify the `x-api-key` header matches your `API_KEY` environment variable
- Ensure the header name is exactly `x-api-key` (case-sensitive)

### Tables don't exist
- Run the SQL initialization script in your Neon database
- Verify tables were created: `SELECT * FROM conversations LIMIT 1;`

## License

MIT

## Support

For issues or questions, please contact your system administrator.
