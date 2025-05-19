import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Definiujemy interfejs dla naszego stanu
interface WorkoutState {
  // Każdy trening ma swój własny stan ukończenia, indeksowany przez ID
  completedWorkouts: { [id: number]: boolean };
  
  // Metoda do ustawienia statusu ukończenia dla konkretnego treningu
  markWorkoutCompleted: (id: number, isCompleted: boolean) => void;
  
  // Metoda do sprawdzenia statusu ukończenia treningu
  isWorkoutCompleted: (id: number) => boolean;
  
  // Metoda do pobrania wszystkich ukończonych treningów
  getCompletedWorkouts: () => number[];
}

// Tworzymy store z wykorzystaniem Zustand i middleware persist (dla zachowania stanu)
export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // Początkowo żaden trening nie jest ukończony
      completedWorkouts: {},
      
      // Metoda ustawiająca status ukończenia dla treningu o podanym ID
      markWorkoutCompleted: (id: number, isCompleted: boolean) => 
        set((state) => {
          // Tworzymy nowy obiekt, aby uniknąć modyfikacji oryginalnego stanu
          const newCompletedWorkouts = { ...state.completedWorkouts };
          
          // Ustawiamy status ukończenia lub usuwamy wpis jeśli trening nie jest ukończony
          if (isCompleted) {
            newCompletedWorkouts[id] = true;
          } else {
            delete newCompletedWorkouts[id];
          }
          
          // Zwracamy nowy stan
          return { completedWorkouts: newCompletedWorkouts };
        }),
      
      // Sprawdza, czy trening o podanym ID jest ukończony
      isWorkoutCompleted: (id: number) => {
        return !!get().completedWorkouts[id];
      },
      
      // Zwraca listę ID ukończonych treningów
      getCompletedWorkouts: () => {
        return Object.keys(get().completedWorkouts)
          .map(id => parseInt(id));
      }
    }),
    {
      // Konfiguracja persist - zapisujemy stan w localStorage pod kluczem 'workout-store'
      name: 'workout-store',
    }
  )
);