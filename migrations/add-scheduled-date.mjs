import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import pkg from '@neondatabase/serverless';
const { neonConfig } = pkg;

// Configure Neon database connection with WebSocket support
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Setup connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Define migration function
async function runMigration() {
  try {
    console.log("Starting migration to add scheduled_date column to completed_workouts table...");
    
    // Execute the migration using raw SQL
    await pool.query(`
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