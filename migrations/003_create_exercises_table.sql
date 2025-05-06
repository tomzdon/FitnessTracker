-- Create exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES workouts(id),
  name TEXT NOT NULL,
  description TEXT,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest_time INTEGER NOT NULL,
  weight DECIMAL,
  order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add sample exercises for Leg Day (workout_id = 5)
INSERT INTO exercises (workout_id, name, description, sets, reps, rest_time, weight, order)
VALUES 
  (5, 'Barbell Squats', 'Stand with feet shoulder-width apart, weight on heels, squat down keeping back straight', 4, 12, 60, 70, 1),
  (5, 'Romanian Deadlifts', 'Stand with feet hip-width apart, bend at hips keeping back straight, lower weight toward floor', 3, 12, 60, 60, 2),
  (5, 'Walking Lunges', 'Step forward into a lunge position, then bring the other foot forward into the next lunge', 3, 10, 45, 20, 3),
  (5, 'Leg Press', 'Sit in leg press machine, press platform away with feet, return to starting position', 4, 15, 60, 140, 4),
  (5, 'Leg Extensions', 'Sit on leg extension machine, extend legs until straight, then return to starting position', 3, 15, 45, 30, 5),
  (5, 'Hamstring Curls', 'Lie face down on hamstring curl machine, curl legs toward buttocks, return to starting position', 3, 12, 45, 25, 6),
  (5, 'Calf Raises', 'Stand with feet shoulder-width apart, raise heels off ground, lower back down', 4, 20, 30, 30, 7);

-- Add sample exercises for Upper Body (workout_id = 6)
INSERT INTO exercises (workout_id, name, description, sets, reps, rest_time, weight, order)
VALUES 
  (6, 'Bench Press', 'Lie on bench, lower barbell to chest, press up to starting position', 4, 10, 90, 80, 1),
  (6, 'Pull-Ups', 'Hang from bar with palms facing away, pull up until chin is over bar', 3, 8, 60, 0, 2),
  (6, 'Dumbbell Shoulder Press', 'Sit or stand with dumbbells at shoulder height, press up overhead', 4, 12, 60, 20, 3),
  (6, 'Barbell Rows', 'Bend at hips, pull barbell to lower chest, lower back to starting position', 3, 12, 60, 60, 4),
  (6, 'Tricep Dips', 'Support body on bars, lower until elbows are 90 degrees, push up', 3, 12, 45, 0, 5),
  (6, 'Bicep Curls', 'Stand with dumbbells at sides, curl up to shoulders, lower back down', 3, 15, 45, 15, 6),
  (6, 'Lateral Raises', 'Stand with dumbbells at sides, raise arms to sides until parallel with floor', 3, 15, 30, 10, 7);

-- Add sample exercises for Core Focus (workout_id = 7)
INSERT INTO exercises (workout_id, name, description, sets, reps, rest_time, weight, order)
VALUES 
  (7, 'Plank', 'Support body on forearms and toes, maintain straight line from head to heels', 3, 60, 45, 0, 1),
  (7, 'Russian Twists', 'Sit with knees bent, twist torso to each side holding weight', 3, 20, 30, 8, 2),
  (7, 'Crunches', 'Lie on back with knees bent, curl shoulders towards knees', 3, 20, 30, 0, 3),
  (7, 'Leg Raises', 'Lie on back, raise straight legs to 90 degrees, lower back down', 3, 15, 45, 0, 4),
  (7, 'Mountain Climbers', 'Start in push-up position, bring knees to chest alternating legs', 3, 30, 30, 0, 5),
  (7, 'Side Planks', 'Support body on one forearm, stack feet, raise hips off ground', 3, 45, 30, 0, 6),
  (7, 'Ab Wheel Rollouts', 'Kneel with ab wheel on floor, roll forward maintaining straight back', 3, 10, 45, 0, 7);

-- Add weight column to exercises if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercises' AND column_name = 'weight'
    ) THEN
        ALTER TABLE exercises ADD COLUMN weight DECIMAL;
    END IF;
END $$;