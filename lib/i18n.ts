export type Locale = "es" | "en"

export const translations = {
  es: {
    // Header & Navigation
    appTitle: "Analítica de Conversaciones",
    signOut: "Cerrar Sesión",
    backToDashboard: "Volver al Panel",

    // Login Page
    signIn: "Iniciar Sesión",
    signInPrompt: "Inicia sesión para acceder a tu panel",
    username: "Usuario",
    password: "Contraseña",
    enterUsername: "Ingresa tu usuario",
    enterPassword: "Ingresa tu contraseña",

    // Dashboard
    totalConversations: "Total de Conversaciones",
    agentSummaries: "Resúmenes de Agente",
    virtualAgent: "Agente Virtual",
    conversationSummaries: "Resúmenes de Conversación",
    recentConversations: "Conversaciones Recientes",
    total: "total",
    noConversations: "No hay conversaciones aún",
    noConversationsDescription: "Las conversaciones aparecerán aquí una vez que se envíen a la API",
    childSummaries: "resúmenes anidados",
    childSummary: "resumen anidado",
    showChildren: "Mostrar resúmenes anidados",
    hideChildren: "Ocultar resúmenes anidados",

    // Conversation Details
    conversationDetails: "Detalles de la Conversación",
    conversationSummary: "Resumen de la Conversación",
    insights: "Perspectivas",
    dateCreated: "Fecha de Creación",
    language: "Idioma",
    summaryId: "ID de Resumen",
    sourceId: "ID de Origen",
    agentId: "ID de Agente",
    conversationIdLabel: "ID de Conversación",

    // Language Names
    spanish: "Español",
    english: "Inglés",

    // Badge Labels
    aiGenerated: "Generado por IA",

    // Media Types
    call: "Llamada",
    email: "Correo Electrónico",
    message: "Mensaje",

    // Summary Types
    agent: "Agente",
    virtualAgentBadge: "Agente Virtual",
    conversation: "Conversación",

    // Insight Types
    reason: "Razón",
    resolution: "Resolución",
    actionItem: "Tarea Pendiente",

    // Insight Labels
    insight: "perspectiva",
    insightPlural: "perspectivas",

    // Delete
    delete: "Eliminar",
    deleteConfirmTitle: "¿Eliminar conversación?",
    deleteConfirmDescription: "Esta acción no se puede deshacer. Esto eliminará permanentemente esta conversación y todos sus datos asociados.",
    deleteParentWarning: "⚠️ Esta es una conversación padre. Al eliminarla también se eliminarán todos los resúmenes de agente y agente virtual asociados.",
    cancel: "Cancelar",
    confirm: "Eliminar",
    deleting: "Eliminando...",
  },
  en: {
    // Header & Navigation
    appTitle: "Conversation Analytics",
    signOut: "Sign Out",
    backToDashboard: "Back to Dashboard",

    // Login Page
    signIn: "Sign In",
    signInPrompt: "Sign in to access your dashboard",
    username: "Username",
    password: "Password",
    enterUsername: "Enter your username",
    enterPassword: "Enter your password",

    // Dashboard
    totalConversations: "Total Conversations",
    agentSummaries: "Agent Summaries",
    virtualAgent: "Virtual Agent",
    conversationSummaries: "Conversation Summaries",
    recentConversations: "Recent Conversations",
    total: "total",
    noConversations: "No conversations yet",
    noConversationsDescription: "Conversations will appear here once they are posted to the API",
    childSummaries: "nested summaries",
    childSummary: "nested summary",
    showChildren: "Show nested summaries",
    hideChildren: "Hide nested summaries",

    // Conversation Details
    conversationDetails: "Conversation Details",
    conversationSummary: "Conversation Summary",
    insights: "Insights",
    dateCreated: "Date Created",
    language: "Language",
    summaryId: "Summary ID",
    sourceId: "Source ID",
    agentId: "Agent ID",
    conversationIdLabel: "Conversation ID",

    // Language Names
    spanish: "Spanish",
    english: "English",

    // Badge Labels
    aiGenerated: "AI Generated",

    // Media Types
    call: "Call",
    email: "Email",
    message: "Message",

    // Summary Types
    agent: "Agent",
    virtualAgentBadge: "Virtual Agent",
    conversation: "Conversation",

    // Insight Types
    reason: "Reason",
    resolution: "Resolution",
    actionItem: "Action Item",

    // Insight Labels
    insight: "insight",
    insightPlural: "insights",

    // Delete
    delete: "Delete",
    deleteConfirmTitle: "Delete conversation?",
    deleteConfirmDescription: "This action cannot be undone. This will permanently delete this conversation and all its associated data.",
    deleteParentWarning: "⚠️ This is a parent conversation. Deleting it will also delete all associated agent and virtual agent summaries.",
    cancel: "Cancel",
    confirm: "Delete",
    deleting: "Deleting...",
  },
} as const

export function getTranslations(locale: Locale) {
  return translations[locale]
}
