import 'dotenv/config';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Get the Supabase database URL
  const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or SUPABASE_DATABASE_URL must be set");
  }

  // Supabase requires SSL but we need to remove any quote characters
  const connectionString = databaseUrl.replace(/^["']|["']$/g, '');
  
  console.log("Connecting to database with connection string:", 
              connectionString.replace(/postgres.*:(.*)@/, 'postgres***:***@'));

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase connection
  });

  try {
    console.log('Starting new migration...');
    
    // Add unsubscribed_at column to user_programs table
    await pool.query(`
      ALTER TABLE user_programs ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP;
    `);
    console.log('Added unsubscribed_at column to user_programs table');
    
    // Create scheduled_workouts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scheduled_workouts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
        workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
        program_day INTEGER NOT NULL,
        scheduled_date DATE NOT NULL,
        is_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created scheduled_workouts table');
    
    // Create indexes for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_id ON scheduled_workouts(user_id);
      CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_scheduled_date ON scheduled_workouts(scheduled_date);
    `);
    console.log('Created indexes for scheduled_workouts table');
    
    // Create exercises table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        workout_id INTEGER NOT NULL REFERENCES workouts(id),
        name TEXT NOT NULL,
        description TEXT,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        rest_time INTEGER NOT NULL,
        weight TEXT,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created exercises table');
    
    // Create index for exercises
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_exercises_workout_id ON exercises(workout_id);
    `);
    console.log('Created index for exercises table');
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();