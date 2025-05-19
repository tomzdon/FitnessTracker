// Ten skrypt naprawia zaplanowane treningi, które mają brakującą datę

import { pool, db } from "../server/db.js";
import { scheduledWorkouts } from "../shared/schema.js";
import { eq, isNull } from "drizzle-orm";

async function fixScheduledWorkouts() {
  console.log("Starting the script to fix scheduled workouts with missing dates...");
  
  try {
    // 1. Znajdź wszystkie treningi bez daty
    const workoutsWithoutDate = await db
      .select()
      .from(scheduledWorkouts)
      .where(isNull(scheduledWorkouts.scheduledDate));
      
    console.log(`Found ${workoutsWithoutDate.length} workouts without a scheduled date.`);
    
    if (workoutsWithoutDate.length === 0) {
      console.log("No workouts need fixing. Exiting.");
      return;
    }
    
    // 2. Dla każdego treningu ustaw datę na podstawie dnia programu (1-30)
    const updates = await Promise.all(workoutsWithoutDate.map(async (workout) => {
      // Ustaw datę na podstawie dnia programu (day 1 = dziś, day 2 = dziś + 1, itd.)
      const today = new Date();
      const scheduledDate = new Date(today);
      scheduledDate.setDate(today.getDate() + (workout.programDay - 1));
      
      console.log(`Fixing workout ID ${workout.id} for program day ${workout.programDay}, setting date to ${scheduledDate.toISOString()}`);
      
      // Wykonaj aktualizację
      return db
        .update(scheduledWorkouts)
        .set({ scheduledDate })
        .where(eq(scheduledWorkouts.id, workout.id))
        .returning();
    }));
    
    const updatedCount = updates.flat().length;
    console.log(`Successfully updated ${updatedCount} workouts.`);
    
    // Pokaż naprawione treningi
    if (updatedCount > 0) {
      console.log("Updated workouts:");
      updates.flat().forEach(workout => {
        console.log(`ID: ${workout.id}, Program: ${workout.programId}, Workout: ${workout.workoutId}, Day: ${workout.programDay}, Date: ${workout.scheduledDate}`);
      });
    }
    
  } catch (error) {
    console.error("Error fixing scheduled workouts:", error);
  } finally {
    await pool.end();
    console.log("Script completed.");
  }
}

// Uruchom skrypt
fixScheduledWorkouts();