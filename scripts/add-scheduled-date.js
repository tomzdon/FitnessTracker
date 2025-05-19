// Ten skrypt dodaje kolumnę scheduled_date do tabeli completed_workouts,
// co pozwoli na śledzenie ukończonych treningów niezależnie dla każdej daty.

import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Załaduj zmienne środowiskowe
dotenv.config();

async function main() {
  console.log('Rozpoczynam migrację: dodawanie kolumny scheduled_date do tabeli completed_workouts...');
  
  // Utwórz nowy basen połączeń
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Sprawdź, czy kolumna scheduled_date istnieje w tabeli completed_workouts
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'completed_workouts' AND column_name = 'scheduled_date'
    `);
    
    // Jeśli kolumna nie istnieje, dodaj ją
    if (checkColumn.rows.length === 0) {
      console.log('Kolumna scheduled_date nie istnieje. Dodawanie...');
      
      // Dodanie kolumny
      await pool.query(`
        ALTER TABLE completed_workouts 
        ADD COLUMN scheduled_date TIMESTAMP
      `);
      
      // Aktualizacja istniejących wpisów
      console.log('Aktualizacja istniejących wpisów...');
      await pool.query(`
        UPDATE completed_workouts 
        SET scheduled_date = completed_at 
        WHERE scheduled_date IS NULL
      `);
      
      console.log('Migracja zakończona pomyślnie!');
    } else {
      console.log('Kolumna scheduled_date już istnieje w tabeli completed_workouts.');
    }
    
  } catch (error) {
    console.error('Błąd podczas wykonywania migracji:', error);
    throw error;
  } finally {
    // Zamknij połączenie
    await pool.end();
    console.log('Połączenie z bazą danych zamknięte.');
  }
}

// Wywołaj funkcję główną
main()
  .then(() => console.log('Migracja zakończona.'))
  .catch(err => {
    console.error('Migracja nie powiodła się:', err);
    process.exit(1);
  });