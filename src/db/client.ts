import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import { databaseUrl } from "@/db/env";
import * as schema from "@/db/schema";

neonConfig.webSocketConstructor = ws;

const globalForDb = globalThis as unknown as { planoriaPool?: Pool };
const pool = globalForDb.planoriaPool ?? new Pool({ connectionString: databaseUrl() });
if (process.env.NODE_ENV !== "production") globalForDb.planoriaPool = pool;

export const db = drizzle({ client: pool, schema });
export type PlanoriaDatabase = typeof db;
