import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Get the Supabase database URL
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or SUPABASE_DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Supabase requires SSL but we need to remove any quote characters
const connectionString = databaseUrl.replace(/^["']|["']$/g, '');

console.log("Connecting to database with connection string:", 
            connectionString.replace(/postgres.*:(.*)@/, 'postgres***:***@'));

// Create a connection pool with SSL enabled for Supabase
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase connection
});

// Create a Drizzle instance
export const db = drizzle(pool, { schema });