-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  difficulty TEXT NOT NULL,
  duration INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create program_workouts table (junction table for many-to-many relationship)
CREATE TABLE IF NOT EXISTS program_workouts (
  id SERIAL PRIMARY KEY,
  program_id INTEGER NOT NULL REFERENCES programs(id),
  workout_id INTEGER NOT NULL REFERENCES workouts(id),
  day INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_programs table for tracking user's assigned programs
CREATE TABLE IF NOT EXISTS user_programs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  program_id INTEGER NOT NULL REFERENCES programs(id),
  current_day INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample program data
INSERT INTO programs (title, description, image_url, difficulty, duration, category)
VALUES 
('MAX Program', 'Complete full-body transformation in 50 days', 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop', 'intermediate', 50, 'strength'),
('Cardio Challenge', 'Boost your cardiovascular fitness in just 30 days', 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=1000&auto=format&fit=crop', 'beginner', 30, 'cardio');

-- Insert sample program workout mappings
-- First, we need some workouts
INSERT INTO workouts (title, description, image_url, duration, type, difficulty)
SELECT 'Leg Day', 'Focus on building leg strength', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop', 40, 'strength', 'intermediate'
WHERE NOT EXISTS (SELECT 1 FROM workouts WHERE title = 'Leg Day');

INSERT INTO workouts (title, description, image_url, duration, type, difficulty)  
SELECT 'Upper Body', 'Chest, back, and arms', 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1000&auto=format&fit=crop', 45, 'strength', 'advanced'
WHERE NOT EXISTS (SELECT 1 FROM workouts WHERE title = 'Upper Body');

INSERT INTO workouts (title, description, image_url, duration, type, difficulty)
SELECT 'Core Focus', 'Abdominal and core strengthening', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop', 30, 'strength', 'beginner'
WHERE NOT EXISTS (SELECT 1 FROM workouts WHERE title = 'Core Focus');

-- Now map workouts to programs
INSERT INTO program_workouts (program_id, workout_id, day)
SELECT p.id, w.id, 1
FROM programs p, workouts w
WHERE p.title = 'MAX Program' AND w.title = 'Leg Day'
AND NOT EXISTS (
  SELECT 1 FROM program_workouts pw 
  WHERE pw.program_id = p.id AND pw.workout_id = w.id AND pw.day = 1
);

INSERT INTO program_workouts (program_id, workout_id, day)
SELECT p.id, w.id, 2
FROM programs p, workouts w
WHERE p.title = 'MAX Program' AND w.title = 'Upper Body'
AND NOT EXISTS (
  SELECT 1 FROM program_workouts pw 
  WHERE pw.program_id = p.id AND pw.workout_id = w.id AND pw.day = 2
);

INSERT INTO program_workouts (program_id, workout_id, day)
SELECT p.id, w.id, 3
FROM programs p, workouts w
WHERE p.title = 'MAX Program' AND w.title = 'Core Focus'
AND NOT EXISTS (
  SELECT 1 FROM program_workouts pw 
  WHERE pw.program_id = p.id AND pw.workout_id = w.id AND pw.day = 3
);

INSERT INTO program_workouts (program_id, workout_id, day)
SELECT p.id, w.id, 1
FROM programs p, workouts w
WHERE p.title = 'Cardio Challenge' AND w.title = 'Core Focus'
AND NOT EXISTS (
  SELECT 1 FROM program_workouts pw 
  WHERE pw.program_id = p.id AND pw.workout_id = w.id AND pw.day = 1
);