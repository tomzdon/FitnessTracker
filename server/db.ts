import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if the Supabase password is set
if (!process.env.SUPABASE_PASSWORD) {
  throw new Error(
    "SUPABASE_PASSWORD must be set. Make sure to set the Supabase database password.",
  );
}

// Create the connection string with environment variables
const connectionString = `postgresql://postgres:${process.env.SUPABASE_PASSWORD}@db.xccojfhjqmdcvfqussij.supabase.co:5432/postgres`;

// Create a connection pool
export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false } // Required for Supabase connection
});

// Create a Drizzle instance
export const db = drizzle(pool, { schema });