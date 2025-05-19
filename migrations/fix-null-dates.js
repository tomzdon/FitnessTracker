// Migracja naprawiająca treningi z NULL w polu scheduledDate

// Import wymaganych zależności
import { db, pool } from '../server/db.js';
import { scheduledWorkouts } from '../shared/schema.js';
import { eq, isNull } from 'drizzle-orm';

async function fixScheduledWorkoutDates() {
  console.log('Rozpoczynam naprawę treningów z NULL w polu scheduledDate...');

  try {
    // Znajdź wszystkie treningi bez daty
    const result = await db.execute(
      `SELECT * FROM scheduled_workouts WHERE scheduled_date IS NULL`
    );
    
    const workoutsToFix = result.rows;
    console.log(`Znaleziono ${workoutsToFix.length} treningów do naprawy`);

    // Dla każdego treningu bez daty, ustaw datę na podstawie dnia programu
    for (const workout of workoutsToFix) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Ustal datę na podstawie dnia programu
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (workout.program_day - 1));
      
      console.log(`Naprawiam trening ID ${workout.id} - dzień programu ${workout.program_day}`);
      console.log(`Ustawiam datę na: ${scheduledDate.toISOString()}`);
      
      // Aktualizuj w bazie danych
      await db.execute(
        `UPDATE scheduled_workouts SET scheduled_date = $1 WHERE id = $2`,
        [scheduledDate, workout.id]
      );
    }

    console.log('Migracja zakończona sukcesem!');
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
  } finally {
    await pool.end();
  }
}

// Uruchom migrację
fixScheduledWorkoutDates()
  .then(() => console.log('Proces zakończony'))
  .catch(err => console.error('Błąd:', err));