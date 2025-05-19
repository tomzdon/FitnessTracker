import pg from 'pg';
const { Pool } = pg;

// Utwórz połączenie do bazy danych
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration: Adding scheduledDate to completed_workouts table');
    
    // Rozpocznij transakcję
    await client.query('BEGIN');
    
    // 1. Sprawdź, czy kolumna scheduledDate już istnieje
    const checkColumnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'completed_workouts' AND column_name = 'scheduled_date'
    `);
    
    if (checkColumnExists.rows.length === 0) {
      // 2. Dodaj kolumnę scheduledDate do tabeli completed_workouts
      console.log('Adding scheduled_date column to completed_workouts table');
      await client.query(`
        ALTER TABLE completed_workouts
        ADD COLUMN scheduled_date TIMESTAMP
      `);
      
      // 3. Zaktualizuj istniejące wpisy, ustawiając datę na podstawie daty ukończenia
      console.log('Updating existing records with completed_at date');
      await client.query(`
        UPDATE completed_workouts
        SET scheduled_date = completed_at
        WHERE scheduled_date IS NULL
      `);
      
      // 4. Upewnij się, że nowe wpisy będą miały scheduledDate
      console.log('Creating unique index on user_id, workout_id, scheduled_date');
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS completed_workouts_unique_workout_date
        ON completed_workouts (user_id, workout_id, scheduled_date)
      `);
      
      // 5. Napraw brakujące daty w scheduled_workouts
      console.log('Fixing scheduled_workouts with NULL scheduled_date');
      const nullDateWorkouts = await client.query(`
        SELECT * FROM scheduled_workouts
        WHERE scheduled_date IS NULL
      `);
      
      for (const workout of nullDateWorkouts.rows) {
        const today = new Date();
        // Ustal datę na podstawie dnia programu (day 1 = dziś, day 2 = dziś + 1, itd.)
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + (workout.program_day - 1));
        
        console.log(`Fixing scheduled workout ID ${workout.id}, day ${workout.program_day}, setting date to ${scheduledDate.toISOString()}`);
        
        await client.query(`
          UPDATE scheduled_workouts
          SET scheduled_date = $1
          WHERE id = $2
        `, [scheduledDate, workout.id]);
      }
      
      console.log('Migration completed successfully');
    } else {
      console.log('Column scheduled_date already exists in completed_workouts table');
    }
    
    // Zatwierdź transakcję
    await client.query('COMMIT');
    console.log('Migration committed successfully');
    
  } catch (error) {
    // W przypadku błędu, wycofaj zmiany
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Zwolnij połączenie
    client.release();
  }
}

// Uruchom migrację i zakończ program po jej wykonaniu
runMigration()
  .then(() => {
    console.log('Migration process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration process failed:', error);
    process.exit(1);
  });