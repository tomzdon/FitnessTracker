// Ten skrypt dodaje kolumnę scheduled_date do tabeli completed_workouts
// i tworzy unikalny indeks dla identyfikacji treningów

import { db, pool } from '../server/db.js';
import { sql } from 'drizzle-orm';

async function addScheduledDateColumn() {
  console.log('Rozpoczynam migrację: dodawanie scheduled_date do completed_workouts...');
  
  try {
    // 1. Dodanie kolumny scheduled_date do tabeli completed_workouts
    console.log('Dodaję kolumnę scheduled_date do tabeli completed_workouts...');
    await db.execute(sql`
      ALTER TABLE completed_workouts 
      ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP
    `);
    
    // 2. Aktualizacja istniejących wpisów - ustawienie scheduledDate na podstawie completedAt
    console.log('Aktualizuję istniejące wpisy, ustawiając scheduled_date = completed_at...');
    await db.execute(sql`
      UPDATE completed_workouts
      SET scheduled_date = completed_at
      WHERE scheduled_date IS NULL
    `);
    
    // 3. Tworzenie unikalnego indeksu dla trojki (user_id, workout_id, scheduled_date)
    console.log('Tworzę unikalny indeks dla (user_id, workout_id, scheduled_date)...');
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS completed_workouts_unique_workout_date
      ON completed_workouts (user_id, workout_id, scheduled_date)
    `);
    
    // 4. Sprawdzenie i naprawienie NULL w scheduled_workouts
    console.log('Sprawdzam i naprawiam NULL w scheduled_workouts...');
    const result = await db.execute(sql`
      SELECT * FROM scheduled_workouts
      WHERE scheduled_date IS NULL
    `);
    
    const workoutsToFix = result.rows;
    console.log(`Znaleziono ${workoutsToFix.length} treningów do naprawy`);
    
    for (const workout of workoutsToFix) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Ustal datę na podstawie dnia programu
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (workout.program_day - 1));
      
      console.log(`Naprawiam trening ID ${workout.id} - dzień programu ${workout.program_day} - ustawiam datę: ${scheduledDate.toISOString()}`);
      
      await db.execute(sql`
        UPDATE scheduled_workouts
        SET scheduled_date = ${scheduledDate}
        WHERE id = ${workout.id}
      `);
    }
    
    console.log('Migracja zakończona sukcesem!');
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Uruchom migrację
addScheduledDateColumn()
  .then(() => {
    console.log('Proces migracji zakończony');
    process.exit(0);
  })
  .catch(error => {
    console.error('Proces migracji zakończony błędem:', error);
    process.exit(1);
  });