import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store przechowujący stan ukończenia dla każdego treningu oddzielnie
// To zapewnia, że każdy trening ma własny, niezależny stan ukończenia

interface WorkoutsState {
  // Mapa ID treningu -> stan ukończenia (true/false)
  completedWorkouts: Record<number, boolean>;
  
  // Oznacz trening jako ukończony lub nieukończony
  setWorkoutStatus: (workoutId: number, isCompleted: boolean) => void;
  
  // Sprawdź, czy trening jest ukończony
  isWorkoutCompleted: (workoutId: number) => boolean;
  
  // Pobierz wszystkie ukończone treningi
  getCompletedWorkouts: () => number[];
}

// Tworzenie magazynu stanu z użyciem Zustand
export const useWorkoutsStore = create<WorkoutsState>()(
  persist(
    (set, get) => ({
      // Początkowo żaden trening nie jest ukończony
      completedWorkouts: {},
      
      // Ustaw status ukończenia dla konkretnego treningu
      setWorkoutStatus: (workoutId: number, isCompleted: boolean) => 
        set((state) => {
          // Tworzymy nowy obiekt stanu z zaktualizowanym statusem dla konkretnego treningu
          const updatedCompletedWorkouts = { ...state.completedWorkouts };
          
          // Jeśli trening jest oznaczony jako ukończony, dodajemy go
          // Jeśli nie jest ukończony, usuwamy go z mapy
          if (isCompleted) {
            updatedCompletedWorkouts[workoutId] = true;
          } else {
            delete updatedCompletedWorkouts[workoutId];
          }
          
          // Zwracamy zaktualizowany stan
          return { completedWorkouts: updatedCompletedWorkouts };
        }),
      
      // Sprawdź, czy trening jest ukończony
      isWorkoutCompleted: (workoutId: number) => 
        !!get().completedWorkouts[workoutId],
      
      // Pobierz wszystkie ukończone treningi (jako listę ID)
      getCompletedWorkouts: () => 
        Object.keys(get().completedWorkouts)
          .filter(id => get().completedWorkouts[parseInt(id)])
          .map(id => parseInt(id))
    }),
    {
      // Konfiguracja Local Storage - zapisujemy stan pod kluczem 'workout-completion-status'
      name: 'workout-completion-status',
    }
  )
);