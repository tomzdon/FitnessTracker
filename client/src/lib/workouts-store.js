// Prosty magazyn do przechowywania stanu ukończenia treningów
// Zapewnia izolację - każdy trening ma swój własny stan ukończenia

// Klucz w localStorage do przechowywania stanów treningów
const STORAGE_KEY = 'workout-completion-states';

// Funkcje do zarządzania stanami ukończenia treningów
export const WorkoutsStore = {
  // Pobierz aktualny stan wszystkich treningów
  getAll: () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  },
  
  // Sprawdź, czy trening jest oznaczony jako ukończony
  isCompleted: (workoutId) => {
    const states = WorkoutsStore.getAll();
    return !!states[workoutId];
  },
  
  // Oznacz trening jako ukończony
  markCompleted: (workoutId) => {
    const states = WorkoutsStore.getAll();
    states[workoutId] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  },
  
  // Oznacz trening jako nieukończony
  markIncomplete: (workoutId) => {
    const states = WorkoutsStore.getAll();
    delete states[workoutId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  },
  
  // Przełącz stan ukończenia treningu
  toggle: (workoutId) => {
    if (WorkoutsStore.isCompleted(workoutId)) {
      WorkoutsStore.markIncomplete(workoutId);
    } else {
      WorkoutsStore.markCompleted(workoutId);
    }
  }
};