# Conversation Analytics API Specification

## **Endpoint**

```
POST /api/conversations
```

## **Authentication**

| Header | Value | Required |
|--------|-------|----------|
| `x-api-key` | Your API key | ✅ Yes |
| `Content-Type` | `application/json` | ✅ Yes |

---

## **Request Body Schema**

```json
{
  "entities": [
    {
      "summaryType": "string",
      "mediaType": "string",
      "language": "string",
      "summaryId": "string",
      "agentId": "string | null",
      "sourceId": "string",
      "summary": "string",
      "generated": boolean,
      "dateCreated": "string (ISO 8601)",
      "conversationId": "string | null",
      "insights": [
        {
          "type": "string",
          "title": "string",
          "description": "string",
          "outcome": "string | null"
        }
      ]
    }
  ]
}
```

---

## **Field Definitions**

### **Root Object**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entities` | Array | ✅ Yes | Array of conversation summary objects |

### **Entity Object**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `summaryType` | String | ✅ Yes | Type of summary: `"Conversation"`, `"Agent"`, or `"VirtualAgent"` |
| `mediaType` | String | ✅ Yes | Channel type: `"Call"`, `"Email"`, `"Message"`, or `"Unknown"` |
| `language` | String | ✅ Yes | ISO language code (e.g., `"es"`, `"en"`) |
| `summaryId` | String | ✅ Yes | Unique identifier for this summary (UUID recommended) |
| `agentId` | String | ❌ No | Agent identifier (typically used for `"Agent"` type) |
| `sourceId` | String | ✅ Yes | Source system/flow identifier |
| `summary` | String | ✅ Yes | The conversation summary text |
| `generated` | Boolean | ✅ Yes | `true` if AI-generated, `false` if human-written |
| `dateCreated` | String | ✅ Yes | ISO 8601 timestamp (e.g., `"2025-12-23T15:30:00.000Z"`) |
| `conversationId` | String | ⚠️ Conditional | **Required** for `"Agent"` and `"VirtualAgent"` types. Must match the `summaryId` of the parent `"Conversation"` summary |
| `insights` | Array \| String | ❌ No | Array of insight objects (see below). **Also accepts a stringified JSON array** for Genesys Data Actions compatibility |

### **Insight Object**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | String | ✅ Yes | Insight type: `"Reason"`, `"Resolution"`, or `"ActionItem"` |
| `title` | String | ✅ Yes | Short title for the insight |
| `description` | String | ✅ Yes | Detailed description of the insight |
| `outcome` | String | ❌ No | Resolution outcome (e.g., `"Resolved"`, `"Partially resolved"`, `"Pending"`) |

---

## **Summary Type Hierarchy**

```
Conversation (Parent)
├── VirtualAgent (Child) ← links via conversationId
└── Agent (Child)        ← links via conversationId
```

- **`Conversation`**: Top-level parent representing the complete interaction
- **`VirtualAgent`**: Summary for bot/IVR portion of the conversation
- **`Agent`**: Summary for human agent portion of the conversation
- Child types (`Agent`, `VirtualAgent`) **must** include `conversationId` matching the parent's `summaryId`

---

## **Examples**

### **1. Parent Conversation with Insights**

```json
{
  "entities": [
    {
      "summaryType": "Conversation",
      "mediaType": "Call",
      "language": "es",
      "summaryId": "conv-2025-001",
      "sourceId": "genesys-flow-main",
      "summary": "Cliente contactó para consultar sobre el paquete Movistar Fusión y opciones de mejora de servicio. Se explicaron los detalles del paquete y se procesó la solicitud de upgrade.",
      "generated": true,
      "dateCreated": "2025-12-23T15:30:00.000Z",
      "insights": [
        {
          "type": "Reason",
          "title": "Información sobre el paquete Movistar Fusión",
          "description": "El cliente quiere conocer los detalles del paquete Movistar Fusión, incluyendo los servicios móviles, el 5G, las ofertas para empresas y las opciones de dispositivos móviles."
        },
        {
          "type": "Resolution",
          "title": "Upgrade procesado",
          "description": "Se procesó la solicitud de mejora del paquete del cliente.",
          "outcome": "Resuelto"
        },
        {
          "type": "ActionItem",
          "title": "Seguimiento de activación",
          "description": "Verificar que el upgrade se active correctamente en las próximas 24 horas."
        }
      ]
    }
  ]
}
```

### **2. Child Summaries (Agent + VirtualAgent)**

```json
{
  "entities": [
    {
      "summaryType": "VirtualAgent",
      "mediaType": "Call",
      "language": "es",
      "summaryId": "va-2025-001",
      "sourceId": "genesys-flow-main",
      "summary": "El asistente virtual saludó al cliente, recopiló sus datos y lo identificó. Detectó interés en mejora de servicios y transfirió a un agente humano.",
      "generated": true,
      "dateCreated": "2025-12-23T15:25:00.000Z",
      "conversationId": "conv-2025-001"
    },
    {
      "summaryType": "Agent",
      "mediaType": "Call",
      "language": "es",
      "summaryId": "agent-2025-001",
      "agentId": "agent-maria-garcia-001",
      "sourceId": "genesys-flow-main",
      "summary": "La agente María explicó los detalles del paquete Movistar Fusión, incluyendo velocidad de fibra de 1Gbps, líneas móviles ilimitadas y TV premium. Procesó el upgrade solicitado por el cliente.",
      "generated": true,
      "dateCreated": "2025-12-23T15:30:00.000Z",
      "conversationId": "conv-2025-001"
    }
  ]
}
```

### **3. Standalone Agent Summary (No Parent)**

```json
{
  "entities": [
    {
      "summaryType": "Agent",
      "mediaType": "Email",
      "language": "en",
      "summaryId": "email-2025-001",
      "agentId": "agent-john-smith-002",
      "sourceId": "email-support-system",
      "summary": "Customer inquired about international roaming charges. Agent provided detailed pricing information and recommended the International Plus add-on package.",
      "generated": true,
      "dateCreated": "2025-12-23T16:00:00.000Z"
    }
  ]
}
```

---

## **Response**

### **Success (200 OK)**

```json
{
  "success": true,
  "inserted": 2,
  "conversations": [
    {
      "id": 123,
      "summaryId": "conv-2025-001"
    },
    {
      "id": 124,
      "summaryId": "va-2025-001"
    }
  ]
}
```

### **Error: Unauthorized (401)**

```json
{
  "error": "Unauthorized"
}
```

### **Error: Bad Request (400)**

```json
{
  "error": "Agent and VirtualAgent summaryTypes require a conversationId"
}
```

```json
{
  "error": "No entities provided"
}
```

---

## **cURL Example**

```bash
curl -X POST https://your-app.vercel.app/api/conversations \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "entities": [
      {
        "summaryType": "Conversation",
        "mediaType": "Call",
        "language": "es",
        "summaryId": "conv-2025-001",
        "sourceId": "genesys-flow",
        "summary": "Resumen completo de la conversación...",
        "generated": true,
        "dateCreated": "2025-12-23T15:30:00.000Z",
        "insights": [
          {
            "type": "Reason",
            "title": "Consulta de servicios",
            "description": "Cliente preguntó sobre opciones de paquetes."
          }
        ]
      }
    ]
  }'
```

---

## **Important Notes**

1. **Duplicate Prevention**: The `summaryId` field must be unique. Attempting to insert a duplicate will result in a database error.

2. **Hierarchy**: Always create the parent `Conversation` summary **before** creating child `Agent`/`VirtualAgent` summaries that reference it via `conversationId`.

3. **Cascade Delete**: When a parent `Conversation` is deleted via the UI, all child summaries linked by `conversationId` are automatically deleted.

4. **Batch Inserts**: Multiple entities can be sent in a single request for efficiency.

---

## **Genesys Cloud Data Actions Integration**

### **Stringified `insights` Support**

Since Genesys Cloud Data Actions **do not support arrays or objects as input types**, the `insights` field can be passed as a **stringified JSON array**. The API will automatically parse it.

**Example stringified insights input:**
```velocity
"[{\"type\":\"Reason\",\"title\":\"Información\",\"description\":\"El cliente quiere conocer detalles.\"}]"
```

### **Complete Velocity Request Template**

```velocity
{
  "entities": [
    {
      "summaryType": "$esc.jsonString(${input.summaryType})",
      "mediaType": "$esc.jsonString(${input.mediaType})",
      "language": "$esc.jsonString(${input.language})",
      "summaryId": "$esc.jsonString(${input.summaryId})",
      "agentId": #if($input.agentId && $input.agentId != "") "$esc.jsonString(${input.agentId})" #else null #end,
      "sourceId": "$esc.jsonString(${input.sourceId})",
      "summary": "$esc.jsonString(${input.summary})",
      "conversationId": "$esc.jsonString(${input.conversationId})",
      "generated": ${input.generated},
      "dateCreated": "$esc.jsonString(${input.dateCreated})"
      #if($input.insights && $input.insights != "") ,"insights": ${input.insights} #end
    }
  ]
}
```

### **Notes for Genesys Scripting/Architect:**

- The `insights` input must be prepared as a **stringified JSON array** before calling the Data Action
- Use `JSON.stringify()` in an Expression or Scripting action to convert the insights array to a string
- The stringified JSON is injected directly (no `$esc.jsonString()` wrapper) because it's already valid JSON
