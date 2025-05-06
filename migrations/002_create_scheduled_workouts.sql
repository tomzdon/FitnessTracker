-- Create scheduled_workouts table to track workout schedules per user
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_id ON scheduled_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_scheduled_date ON scheduled_workouts(scheduled_date);

-- Add unsubscribe endpoint to user_programs table
ALTER TABLE user_programs 
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP;