-- Create exercises table if it doesn't exist
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