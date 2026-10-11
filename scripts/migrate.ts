import { migrate } from "drizzle-orm/libsql/migrator";
import { db, rawClient } from "../src/db/client";
import path from "node:path";
import fs from "node:fs";

async function runMigrate() {
  const migrationsFolder = path.resolve(process.cwd(), "src/db/migrations");
  if (!fs.existsSync(migrationsFolder)) {
    console.warn(`Migrations folder not found at ${migrationsFolder}. Run 'pnpm db:generate' first.`);
    return;
  }
  console.log(`Applying migrations from ${migrationsFolder}...`);
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully.");
  rawClient.close();
}

runMigrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
