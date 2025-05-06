-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  workout_id INTEGER NOT NULL REFERENCES workouts(id),
  name TEXT NOT NULL,
  description TEXT,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest_time INTEGER NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add some example exercises for demonstration
INSERT INTO exercises (workout_id, name, description, sets, reps, rest_time, "order", created_at)
VALUES
  (1, 'Squats', 'Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to starting position.', 3, 12, 60, 1, NOW()),
  (1, 'Push-ups', 'Start in plank position with hands shoulder-width apart, lower your chest to the floor, then push back up.', 3, 10, 60, 2, NOW()),
  (1, 'Lunges', 'Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.', 3, 10, 60, 3, NOW()),
  (1, 'Plank', 'Hold forearm plank position with core engaged for 30-60 seconds.', 3, 1, 60, 4, NOW()),
  
  (2, 'Jump Rope', 'Jump with both feet, turning the rope under your feet and over your head.', 3, 50, 45, 1, NOW()),
  (2, 'Mountain Climbers', 'Start in plank position and alternate bringing knees to chest in a running motion.', 3, 20, 45, 2, NOW()),
  (2, 'Burpees', 'Start standing, drop to a squat, kick feet back to plank, do a push-up, return to squat, then jump up.', 3, 10, 60, 3, NOW()),
  (2, 'High Knees', 'Run in place, bringing knees up to hip height with each step.', 3, 30, 45, 4, NOW()),
  
  (3, 'Bench Press', 'Lie on bench, lower barbell to chest, then press back up to starting position.', 4, 8, 90, 1, NOW()),
  (3, 'Bicep Curls', 'Hold dumbbells at sides, curl up toward shoulders, then lower back down.', 3, 12, 60, 2, NOW()),
  (3, 'Tricep Dips', 'Support body on parallel bars or bench edge, lower by bending elbows, then push back up.', 3, 12, 60, 3, NOW()),
  (3, 'Shoulder Press', 'Sit or stand with dumbbells at shoulder height, press upward until arms are extended, lower back down.', 3, 10, 60, 4, NOW());