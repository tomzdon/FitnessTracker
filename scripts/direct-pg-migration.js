// Ten skrypt używa bezpośrednio klienta pg do wykonania migracji
// Dodaje kolumnę scheduled_date do tabeli completed_workouts i tworzy unikalny indeks

import pg from 'pg';
const { Pool } = pg;

async function runMigration() {
  // Utwórz połączenie z bazą danych
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  // Pobierz klienta z puli
  const client = await pool.connect();
  
  try {
    console.log('Rozpoczynam migrację: dodawanie scheduled_date do completed_workouts...');
    
    // Rozpocznij transakcję
    await client.query('BEGIN');
    
    // 1. Sprawdź, czy kolumna scheduledDate już istnieje
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'completed_workouts' AND column_name = 'scheduled_date'
    `);
    
    if (columnCheck.rows.length === 0) {
      // 2. Dodaj kolumnę, jeśli nie istnieje
      console.log('Dodaję kolumnę scheduled_date do tabeli completed_workouts...');
      await client.query(`
        ALTER TABLE completed_workouts 
        ADD COLUMN scheduled_date TIMESTAMP
      `);
      
      // 3. Wypełnij kolumnę danymi
      console.log('Aktualizuję istniejące wpisy, ustawiając scheduled_date = completed_at...');
      await client.query(`
        UPDATE completed_workouts
        SET scheduled_date = completed_at
        WHERE scheduled_date IS NULL
      `);
      
      // 4. Dodaj unikalny indeks na scheduledDate, userId i workoutId
      console.log('Tworzę unikalny indeks dla (user_id, workout_id, scheduled_date)...');
      await client.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE indexname = 'completed_workouts_unique_workout_date'
          ) THEN
            CREATE UNIQUE INDEX completed_workouts_unique_workout_date
            ON completed_workouts (user_id, workout_id, scheduled_date);
          END IF;
        END
        $$;
      `);
    } else {
      console.log('Kolumna scheduled_date już istnieje w tabeli completed_workouts');
    }
    
    // 5. Napraw NULL w scheduled_workouts
    console.log('Sprawdzam scheduled_workouts z NULL w polu scheduled_date...');
    const workoutsToFix = await client.query(`
      SELECT * FROM scheduled_workouts 
      WHERE scheduled_date IS NULL
    `);
    
    if (workoutsToFix.rows.length > 0) {
      console.log(`Znaleziono ${workoutsToFix.rows.length} treningów do naprawy`);
      
      // Napraw każdy trening z brakującą datą
      for (const workout of workoutsToFix.rows) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Ustal datę na podstawie dnia programu
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + (workout.program_day - 1));
        
        console.log(`Naprawiam trening ID ${workout.id} - dzień programu ${workout.program_day} - ustawiam datę: ${scheduledDate.toISOString()}`);
        
        await client.query(`
          UPDATE scheduled_workouts
          SET scheduled_date = $1
          WHERE id = $2
        `, [scheduledDate, workout.id]);
      }
    } else {
      console.log('Brak treningów z NULL w polu scheduled_date');
    }
    
    // 6. Potwierdź transakcję
    await client.query('COMMIT');
    console.log('Migracja zakończona sukcesem!');
    
  } catch (error) {
    // Wycofaj transakcję w przypadku błędu
    await client.query('ROLLBACK');
    console.error('Błąd podczas migracji:', error);
    throw error;
  } finally {
    // Zwolnij klienta
    client.release();
    
    // Zakończ połączenie z bazą danych
    await pool.end();
  }
}

// Uruchom migrację
runMigration()
  .then(() => {
    console.log('Proces migracji zakończony pomyślnie');
    process.exit(0);
  })
  .catch(error => {
    console.error('Proces migracji zakończony błędem:', error);
    process.exit(1);
  });