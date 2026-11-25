import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export async function checkDatabaseConnection() {
  try {
    await db.execute(sql`select 1`);
    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Connexion PostgreSQL indisponible." };
  }
}
