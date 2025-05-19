import { pgTable, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Enable WebSocket support for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Setup connection pool and Drizzle instance
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// Define migration function
async function runMigration() {
  try {
    console.log("Starting migration to add scheduled_date column to completed_workouts table...");
    
    // Execute the migration using raw SQL
    await db.execute(`
      ALTER TABLE "completed_workouts"
      ADD COLUMN IF NOT EXISTS "scheduled_date" TIMESTAMP;
    `);
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);