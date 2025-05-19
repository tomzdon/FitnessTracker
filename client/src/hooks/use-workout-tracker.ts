import { useState, useEffect } from 'react';

// Klucz używany do przechowywania w localStorage
const STORAGE_KEY = 'cgx-workout-completion-tracker';

// Typ do przechowywania informacji o ukończeniu treningów
type WorkoutCompletionMap = {
  [key: string]: boolean;
};

/**
 * Tworzy unikalny identyfikator dla treningu na podstawie ID i daty
 * @param id Identyfikator treningu
 * @param date Data treningu w formacie YYYY-MM-DD
 * @returns Unikalny identyfikator treningu
 */
export function createWorkoutKey(id: number, date: string): string {
  return `workout_${id}_${date}`;
}

/**
 * Hook do zarządzania ukończeniem treningów
 * Zapewnia niezależne śledzenie statusu każdego treningu na podstawie ID i daty
 */
export function useWorkoutTracker() {
  // Stan przechowujący informacje o ukończonych treningach
  const [completedWorkouts, setCompletedWorkouts] = useState<WorkoutCompletionMap>({});
  
  // Ładowanie stanu z localStorage przy inicjalizacji
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        setCompletedWorkouts(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Błąd podczas ładowania danych treningów:', error);
    }
  }, []);
  
  // Zapisywanie stanu do localStorage przy zmianach
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedWorkouts));
    } catch (error) {
      console.error('Błąd podczas zapisywania danych treningów:', error);
    }
  }, [completedWorkouts]);
  
  /**
   * Sprawdza, czy trening został ukończony
   * @param id Identyfikator treningu
   * @param date Data treningu w formacie YYYY-MM-DD
   * @returns True jeśli trening został ukończony, false w przeciwnym razie
   */
  const isWorkoutCompleted = (id: number, date: string): boolean => {
    const key = createWorkoutKey(id, date);
    return completedWorkouts[key] === true;
  };
  
  /**
   * Ustawia status ukończenia treningu
   * @param id Identyfikator treningu
   * @param date Data treningu w formacie YYYY-MM-DD
   * @param completed Status ukończenia (true/false)
   */
  const setWorkoutCompleted = (id: number, date: string, completed: boolean) => {
    const key = createWorkoutKey(id, date);
    setCompletedWorkouts(prev => ({
      ...prev,
      [key]: completed
    }));
  };
  
  /**
   * Przełącza status ukończenia treningu
   * @param id Identyfikator treningu
   * @param date Data treningu w formacie YYYY-MM-DD
   * @returns Nowy status ukończenia
   */
  const toggleWorkoutCompleted = (id: number, date: string): boolean => {
    const currentStatus = isWorkoutCompleted(id, date);
    const newStatus = !currentStatus;
    setWorkoutCompleted(id, date, newStatus);
    return newStatus;
  };
  
  /**
   * Zwraca wszystkie ukończone treningi
   * @returns Mapa ukończonych treningów
   */
  const getAllCompletedWorkouts = (): WorkoutCompletionMap => {
    return { ...completedWorkouts };
  };
  
  /**
   * Czyści wszystkie dane o ukończonych treningach
   */
  const clearAllCompletedWorkouts = () => {
    setCompletedWorkouts({});
  };
  
  return {
    isWorkoutCompleted,
    setWorkoutCompleted,
    toggleWorkoutCompleted,
    getAllCompletedWorkouts,
    clearAllCompletedWorkouts
  };
}