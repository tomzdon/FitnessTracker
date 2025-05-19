const { Pool } = require('pg');

// Prosty skrypt dodający kolumnę scheduled_date do tabeli completed_workouts
async function main() {
  try {
    // Połącz z bazą danych używając zmiennej środowiskowej DATABASE_URL
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('Dodaję kolumnę scheduled_date do tabeli completed_workouts...');
    
    // Wykonaj zapytanie do bazy danych
    await pool.query(`
      ALTER TABLE completed_workouts
      ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP;
    `);
    
    console.log('Kolumna została dodana pomyślnie!');
    await pool.end();
    
  } catch (error) {
    console.error('Wystąpił błąd:', error);
  }
}

// Uruchom skrypt
main();