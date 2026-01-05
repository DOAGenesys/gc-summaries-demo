import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

// Lazy initialization to avoid throwing at module import time
// This allows the app to start and show better error messages
let _sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (_sql) {
    return _sql
  }
  
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set")
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please configure this in your Vercel project settings."
    )
  }
  
  _sql = neon(databaseUrl)
  return _sql
}

// Export a proxy that lazily initializes the connection
export const sql: NeonQueryFunction<false, false> = new Proxy(
  (() => {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply: (_target, _thisArg, args) => {
      return getSql()(...args)
    },
    get: (_target, prop) => {
      const realSql = getSql()
      return (realSql as unknown as Record<string | symbol, unknown>)[prop]
    }
  }
)
