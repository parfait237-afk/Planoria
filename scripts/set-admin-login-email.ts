import { config } from "dotenv";
import { and, eq, sql } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const email = process.env.TEST_ALLOWED_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error("TEST_ALLOWED_EMAIL est absent.");
  const { db } = await import("../src/db/client");
  const { users } = await import("../src/db/schema");
  const administrators = await db.select({ id: users.id, email: users.email }).from(users).where(and(eq(users.role, "administrator"), eq(users.active, true)));
  if (administrators.length !== 1) throw new Error("L’initialisation exige exactement un administrateur actif.");
  const existing = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
  if (existing.length && existing[0].id !== administrators[0].id) throw new Error("L’adresse configurée appartient déjà à un autre compte.");
  await db.update(users).set({ email, emailVerified: false, updatedAt: new Date() }).where(eq(users.id, administrators[0].id));
  console.log("Adresse de connexion de l’administrateur synchronisée avec TEST_ALLOWED_EMAIL.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
