/**
 * WorkoutCompletion - klasa do zarządzania stanem ukończenia treningów
 * 
 * Ta klasa zapewnia, że każdy trening ma swój własny, niezależny stan ukończenia,
 * co rozwiązuje problem, w którym oznaczenie jednego treningu jako "zrobiony"
 * wpływa na inne treningi.
 * 
 * Wersja 2.0 - teraz używa unikalnych kluczy dla każdej instancji treningu z danego dnia,
 * zapewniając że ten sam trening zaplanowany na różne dni jest śledzony niezależnie.
 */

// Klucz lokalnego magazynu dla przechowywania stanów ukończenia
const STORAGE_KEY = 'workout-completion-states';

// Interfejs stanu ukończenia treningów
// Używamy klucza złożonego z ID treningu i daty, aby każdy trening miał niezależny stan ukończenia
interface CompletionState {
  [compositeKey: string]: boolean;
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
   * Tworzy unikalny klucz kompozytowy dla treningu na podstawie ID i opcjonalnej daty
   */
  private static createKey(workoutId: number, date?: string): string {
    // Jeśli data jest podana, użyj jej, w przeciwnym razie użyj tylko ID
    return date ? `${workoutId}_${date}` : `${workoutId}`;
  }

  /**
   * Sprawdza, czy konkretny trening o podanym ID i dacie jest ukończony
   */
  static isCompleted(workoutId: number, date?: string): boolean {
    WorkoutCompletion.init();
    const key = this.createKey(workoutId, date);
    return !!WorkoutCompletion.states[key];
  }

  /**
   * Ustawia stan ukończenia dla treningu o podanym ID i dacie
   */
  static setCompleted(workoutId: number, isCompleted: boolean, date?: string): void {
    WorkoutCompletion.init();
    const key = this.createKey(workoutId, date);
    
    // Jeśli trening ma być oznaczony jako ukończony
    if (isCompleted) {
      WorkoutCompletion.states[key] = true;
    } 
    // Jeśli trening ma być oznaczony jako nieukończony
    else {
      delete WorkoutCompletion.states[key];
    }
    
    // Zapisujemy zmieniony stan
    WorkoutCompletion.save();
  }

  /**
   * Przełącza stan ukończenia treningu o podanym ID i dacie
   */
  static toggleCompleted(workoutId: number, date?: string): boolean {
    const currentState = WorkoutCompletion.isCompleted(workoutId, date);
    WorkoutCompletion.setCompleted(workoutId, !currentState, date);
    return !currentState;
  }

  /**
   * Zwraca listę kluczy ukończonych treningów
   */
  static getCompletedWorkouts(): string[] {
    WorkoutCompletion.init();
    return Object.entries(WorkoutCompletion.states)
      .filter(([_, isCompleted]) => isCompleted)
      .map(([key, _]) => key);
  }
  
  /**
   * Sprawdza, czy konkretna instancja treningu jest ukończona
   * używając ID zaplanowanego treningu
   */
  static isScheduledWorkoutCompleted(scheduledWorkoutId: number): boolean {
    // Dla kompatybilności ze starym podejściem, używamy również ID jako bezpośredniego klucza
    return WorkoutCompletion.isCompleted(scheduledWorkoutId);
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