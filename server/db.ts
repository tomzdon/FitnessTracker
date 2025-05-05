import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if the Supabase database URL is set
if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Make sure the Supabase credentials are configured.",
  );
}

// Create a connection pool
export const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase connection
});

// Create a Drizzle instance
export const db = drizzle(pool, { schema });