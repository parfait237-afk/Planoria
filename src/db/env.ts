export function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL n’est pas configurée dans l’environnement serveur.");
  const normalized = value.replaceAll("`", "").trim();
  if (normalized.startsWith("http")) throw new Error("DATABASE_URL doit être une URL PostgreSQL Neon.");
  return normalized;
}
