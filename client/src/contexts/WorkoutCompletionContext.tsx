import React, { createContext, useState, useContext, useEffect } from 'react';

// Type definitions
type WorkoutCompletionContextType = {
  isCompleted: (workoutId: number, date: string) => boolean;
  setCompleted: (workoutId: number, date: string, completed: boolean) => void;
  toggleCompleted: (workoutId: number, date: string) => boolean;
};

// Storage key for localStorage
const STORAGE_KEY = 'cgx-workout-completions';

// Create context with default values
const WorkoutCompletionContext = createContext<WorkoutCompletionContextType | null>(null);

// Create composite key from workout ID and date
const createKey = (workoutId: number, date: string): string => {
  return `${workoutId}_${date}`;
};

// Provider component
export const WorkoutCompletionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to track completed workouts
  const [completedWorkouts, setCompletedWorkouts] = useState<Record<string, boolean>>({});
  
  // Load saved completion data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompletedWorkouts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load workout completion data:', error);
    }
  }, []);
  
  // Save to localStorage whenever completedWorkouts changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedWorkouts));
    } catch (error) {
      console.error('Failed to save workout completion data:', error);
    }
  }, [completedWorkouts]);
  
  // Check if a workout is completed
  const isCompleted = (workoutId: number, date: string): boolean => {
    const key = createKey(workoutId, date);
    return !!completedWorkouts[key];
  };
  
  // Set a workout's completion status
  const setCompleted = (workoutId: number, date: string, completed: boolean): void => {
    const key = createKey(workoutId, date);
    setCompletedWorkouts(prev => {
      const newState = { ...prev };
      if (completed) {
        newState[key] = true;
      } else {
        delete newState[key];
      }
      return newState;
    });
  };
  
  // Toggle a workout's completion status
  const toggleCompleted = (workoutId: number, date: string): boolean => {
    const currentStatus = isCompleted(workoutId, date);
    const newStatus = !currentStatus;
    setCompleted(workoutId, date, newStatus);
    return newStatus;
  };
  
  // Provide context value
  const contextValue: WorkoutCompletionContextType = {
    isCompleted,
    setCompleted,
    toggleCompleted
  };
  
  return (
    <WorkoutCompletionContext.Provider value={contextValue}>
      {children}
    </WorkoutCompletionContext.Provider>
  );
};

// Custom hook to use the context
export const useWorkoutCompletion = (): WorkoutCompletionContextType => {
  const context = useContext(WorkoutCompletionContext);
  if (!context) {
    throw new Error('useWorkoutCompletion must be used within a WorkoutCompletionProvider');
  }
  return context;
};