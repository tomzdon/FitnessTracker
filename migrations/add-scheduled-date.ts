import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

async function runMigration() {
  console.log("Starting migration...");

  // Nie używamy pool z server/db.js, ponieważ powoduje to problemy z importami
  // Zamiast tego, tworzymy nowe połączenie bezpośrednio tutaj
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Checking if scheduled_date column exists...");
    
    // Sprawdź, czy kolumna już istnieje
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'completed_workouts' 
      AND column_name = 'scheduled_date'
    `;
    
    if (checkColumn.length === 0) {
      console.log("Column doesn't exist. Adding scheduled_date column to completed_workouts table...");
      
      // Dodaj kolumnę scheduled_date
      await sql`
        ALTER TABLE completed_workouts 
        ADD COLUMN scheduled_date TIMESTAMP
      `;
      
      console.log("Column added successfully!");
    } else {
      console.log("Column scheduled_date already exists!");
    }
    
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

runMigration()
  .then(() => {
    console.log("Migration process finished.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error:", error);
    process.exit(1);
  });