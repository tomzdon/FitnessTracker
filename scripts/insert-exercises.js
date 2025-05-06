import 'dotenv/config';
import { Pool } from 'pg';

async function insertExercises() {
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
    console.log('Starting exercise data insertion...');

    // Get all workout IDs
    const workoutResult = await pool.query('SELECT id FROM workouts');
    const workoutIds = workoutResult.rows.map(row => row.id);
    
    if (workoutIds.length === 0) {
      console.log('No workouts found in the database.');
      return;
    }
    
    console.log('Found workout IDs:', workoutIds);
    
    // For each workout, add some exercises
    for (const workoutId of workoutIds) {
      const exercises = [
        {
          name: "Squats",
          sets: 3,
          reps: 12,
          restTime: 60,
          weight: "70",
          description: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to starting position.",
          order: 1
        },
        {
          name: "Push-ups",
          sets: 3,
          reps: 10,
          restTime: 60,
          weight: null,
          description: "Start in plank position with hands shoulder-width apart, lower your chest to the floor, then push back up.",
          order: 2
        },
        {
          name: "Lunges",
          sets: 3,
          reps: 10,
          restTime: 60,
          weight: "20",
          description: "Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.",
          order: 3
        },
        {
          name: "Plank",
          sets: 3,
          reps: 1,
          restTime: 60,
          weight: null,
          description: "Hold forearm plank position with core engaged for 30-60 seconds.",
          order: 4
        }
      ];
      
      // First, check if exercises already exist for this workout
      const existingResult = await pool.query('SELECT COUNT(*) FROM exercises WHERE workout_id = $1', [workoutId]);
      const existingCount = parseInt(existingResult.rows[0].count);
      
      if (existingCount > 0) {
        console.log(`Workout ${workoutId} already has ${existingCount} exercises, skipping...`);
        continue;
      }
      
      // Insert exercises for this workout
      for (const exercise of exercises) {
        await pool.query(`
          INSERT INTO exercises (
            workout_id, name, description, sets, reps, rest_time, weight, "order", created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          workoutId,
          exercise.name,
          exercise.description,
          exercise.sets,
          exercise.reps,
          exercise.restTime,
          exercise.weight,
          exercise.order
        ]);
      }
      
      console.log(`Added ${exercises.length} exercises to workout ${workoutId}`);
    }
    
    console.log('Exercise data insertion completed successfully');
  } catch (error) {
    console.error('Exercise data insertion failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

insertExercises();
