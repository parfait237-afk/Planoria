import { config } from "dotenv";
import { sql } from "drizzle-orm";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  try {
    const { db } = await import("../src/db/client");
    const tables = await db.execute<{ table_name: string }>(sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE'
      order by table_name
    `);
    const counts = await db.execute<{ entity: string; count: string }>(sql`
      select 'collaborators' entity, count(*)::text count from collaborators
      union all select 'projects', count(*)::text from projects
      union all select 'tasks', count(*)::text from tasks
      union all select 'task_decisions', count(*)::text from task_decisions
      union all select 'activity_events', count(*)::text from activity_events
    `);
    console.log(JSON.stringify({ tables: tables.rows.map((row) => row.table_name), counts: Object.fromEntries(counts.rows.map((row) => [row.entity, Number(row.count)])) }, null, 2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Inspection PostgreSQL impossible.");
    process.exitCode = 1;
  }
}

void main();
