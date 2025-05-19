/**
 * WorkoutCompletion - klasa do zarządzania stanem ukończenia treningów
 * 
 * Ta klasa zapewnia, że każdy trening ma swój własny, niezależny stan ukończenia,
 * co rozwiązuje problem, w którym oznaczenie jednego treningu jako "zrobiony"
 * wpływa na inne treningi.
 */

// Klucz lokalnego magazynu dla przechowywania stanów ukończenia
const STORAGE_KEY = 'workout-completion-states';

// Interfejs stanu ukończenia treningów
interface CompletionState {
  [workoutId: number]: boolean;
}

/**
 * Klasa WorkoutCompletion zarządza niezależnymi stanami ukończenia treningów
 */
export class WorkoutCompletion {
  private static states: CompletionState = {};
  private static initialized = false;

  /**
   * Inicjalizuje stan ukończenia treningów, ładując go z localStorage
   */
  static init(): void {
    if (!WorkoutCompletion.initialized) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          WorkoutCompletion.states = JSON.parse(stored);
        }
      } catch (err) {
        console.error('Błąd podczas ładowania stanów ukończenia treningów:', err);
        WorkoutCompletion.states = {};
      }
      WorkoutCompletion.initialized = true;
    }
  }

  /**
   * Zapisuje aktualny stan ukończenia treningów do localStorage
   */
  private static save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(WorkoutCompletion.states));
    } catch (err) {
      console.error('Błąd podczas zapisywania stanów ukończenia treningów:', err);
    }
  }

  /**
   * Sprawdza, czy trening o podanym ID jest ukończony
   */
  static isCompleted(workoutId: number): boolean {
    WorkoutCompletion.init();
    return !!WorkoutCompletion.states[workoutId];
  }

  /**
   * Ustawia stan ukończenia dla treningu o podanym ID
   */
  static setCompleted(workoutId: number, isCompleted: boolean): void {
    WorkoutCompletion.init();
    
    // Jeśli trening ma być oznaczony jako ukończony
    if (isCompleted) {
      WorkoutCompletion.states[workoutId] = true;
    } 
    // Jeśli trening ma być oznaczony jako nieukończony
    else {
      delete WorkoutCompletion.states[workoutId];
    }
    
    // Zapisujemy zmieniony stan
    WorkoutCompletion.save();
  }

  /**
   * Przełącza stan ukończenia treningu o podanym ID
   */
  static toggleCompleted(workoutId: number): boolean {
    const currentState = WorkoutCompletion.isCompleted(workoutId);
    WorkoutCompletion.setCompleted(workoutId, !currentState);
    return !currentState;
  }

  /**
   * Zwraca listę ID ukończonych treningów
   */
  static getCompletedWorkouts(): number[] {
    WorkoutCompletion.init();
    return Object.entries(WorkoutCompletion.states)
      .filter(([_, isCompleted]) => isCompleted)
      .map(([id, _]) => parseInt(id));
  }

  /**
   * Czyści wszystkie stany ukończenia treningów
   */
  static clearAll(): void {
    WorkoutCompletion.states = {};
    WorkoutCompletion.save();
  }
}

// Inicjalizujemy stan przy importowaniu
WorkoutCompletion.init();