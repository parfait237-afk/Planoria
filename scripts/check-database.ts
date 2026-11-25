import { config } from "dotenv";

config({path:".env.local"});
config({path:".env"});

async function main() {
  try {
    const { checkDatabaseConnection } = await import("../src/db/health");
    const result = await checkDatabaseConnection();
    if (!result.ok) throw new Error(result.message);
    console.log("Connexion PostgreSQL et requête minimale réussies.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Connexion PostgreSQL indisponible.");
    process.exitCode = 1;
  }
}

void main();
