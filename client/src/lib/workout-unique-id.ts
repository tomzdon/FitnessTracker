/**
 * Utilities for creating and managing unique workout identifiers
 * 
 * This solves the issue where marking one workout as completed affects all workouts
 * with the same ID but on different dates
 */

/**
 * Creates a unique identifier for a workout based on its ID and scheduled date
 * 
 * @param workoutId The base workout ID
 * @param date The date string of the workout (YYYY-MM-DD format)
 * @returns A unique string identifier
 */
export function createUniqueWorkoutId(workoutId: number, date: string): string {
  return `workout_${workoutId}_${date}`;
}

/**
 * Extracts the original workout ID from a unique workout identifier
 * 
 * @param uniqueId The unique workout identifier
 * @returns The original workout ID
 */
export function extractWorkoutId(uniqueId: string): number {
  const parts = uniqueId.split('_');
  return parseInt(parts[1]);
}

/**
 * Extracts the date from a unique workout identifier
 * 
 * @param uniqueId The unique workout identifier
 * @returns The date string in YYYY-MM-DD format
 */
export function extractWorkoutDate(uniqueId: string): string {
  const parts = uniqueId.split('_');
  return parts.slice(2).join('_');
}

/**
 * Storage for tracking completed workouts via their unique identifiers
 */
class WorkoutUniqueIdStorage {
  private static STORAGE_KEY = 'workout-unique-ids-completed';
  private completedIds: Set<string> = new Set();
  private initialized = false;

  /**
   * Initializes the storage by loading from localStorage
   */
  private init(): void {
    if (!this.initialized) {
      try {
        const stored = localStorage.getItem(WorkoutUniqueIdStorage.STORAGE_KEY);
        if (stored) {
          const ids = JSON.parse(stored);
          this.completedIds = new Set(ids);
        }
      } catch (error) {
        console.error('Error loading workout completion data:', error);
        this.completedIds = new Set();
      }
      this.initialized = true;
    }
  }

  /**
   * Saves the current state to localStorage
   */
  private save(): void {
    try {
      const idsArray = Array.from(this.completedIds);
      localStorage.setItem(WorkoutUniqueIdStorage.STORAGE_KEY, JSON.stringify(idsArray));
    } catch (error) {
      console.error('Error saving workout completion data:', error);
    }
  }

  /**
   * Marks a workout as completed using its unique ID
   * 
   * @param workoutId The workout ID
   * @param date The date string (YYYY-MM-DD)
   * @param isCompleted Whether the workout is completed
   */
  markCompleted(workoutId: number, date: string, isCompleted: boolean): void {
    this.init();
    const uniqueId = createUniqueWorkoutId(workoutId, date);
    
    if (isCompleted) {
      this.completedIds.add(uniqueId);
    } else {
      this.completedIds.delete(uniqueId);
    }
    
    this.save();
  }

  /**
   * Checks if a workout is completed by its unique ID
   * 
   * @param workoutId The workout ID
   * @param date The date string (YYYY-MM-DD)
   * @returns Whether the workout is marked as completed
   */
  isCompleted(workoutId: number, date: string): boolean {
    this.init();
    const uniqueId = createUniqueWorkoutId(workoutId, date);
    return this.completedIds.has(uniqueId);
  }

  /**
   * Gets all completed unique workout IDs
   * 
   * @returns Array of unique workout IDs
   */
  getAllCompletedIds(): string[] {
    this.init();
    return Array.from(this.completedIds);
  }

  /**
   * Clears all completion data
   */
  clearAll(): void {
    this.completedIds.clear();
    this.save();
  }
}

// Create a singleton instance
export const workoutUniqueIdStorage = new WorkoutUniqueIdStorage();