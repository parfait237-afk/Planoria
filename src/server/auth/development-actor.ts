import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const DEVELOPMENT_ACTOR_ID = "00000000-0000-4000-8000-000000000001";

export async function requireActor() {
  if (process.env.NODE_ENV === "production") throw new Error("L’authentification doit être configurée avant d’autoriser les mutations en production.");
  const [actor] = await db.select({ id: users.id, name: users.displayName }).from(users).where(eq(users.id, DEVELOPMENT_ACTOR_ID)).limit(1);
  if (!actor) throw new Error("L’acteur technique de développement est absent de la base.");
  return actor;
}
