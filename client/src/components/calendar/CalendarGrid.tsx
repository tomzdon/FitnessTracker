import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { WorkoutCompletion } from "@/lib/workout-completion";

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

interface ScheduledWorkout {
  id: number;
  scheduledDate: string;
  workoutId: number;
  isCompleted: boolean;
}

const CalendarGrid = ({ year, month, selectedDate, onSelectDate }: CalendarGridProps) => {
  // Create a map to track scheduled workouts by day
  const [scheduledWorkoutsByDay, setScheduledWorkoutsByDay] = useState<Record<number, ScheduledWorkout[]>>({});
  
  // Generate calendar grid data
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayOfWeekAdjustment = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
  
  // Create the grid with days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Day names (Monday first)
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  
  // Calculate start and end dates for the month
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  
  // Format dates for the API
  const startDate = format(start, 'yyyy-MM-dd');
  const endDate = format(end, 'yyyy-MM-dd');
  
  // Fetch scheduled workouts for the current month
  const { data: monthWorkouts = [], isLoading } = useQuery<ScheduledWorkout[]>({
    queryKey: ['/api/scheduled-workouts/range', startDate, endDate],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/scheduled-workouts/range/${startDate}/${endDate}`);
        
        if (response.status === 401) {
          return []; // Not authenticated
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch workouts');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching scheduled workouts:', error);
        return [];
      }
    },
  });
  
  // Organize scheduled workouts by day - prevent infinite loop by using a more stable approach
  // Using a ref to avoid infinite rendering cycles
  useEffect(() => {
    // Skip the effect if no workouts
    if (!monthWorkouts || monthWorkouts.length === 0) {
      return;
    }
    
    // Convert scheduled workouts into a lookup map by day
    const workoutsByDay: Record<number, ScheduledWorkout[]> = {};
    
    // Process all workouts once
    for (const workout of monthWorkouts) {
      try {
        const workoutDate = new Date(workout.scheduledDate);
        const day = workoutDate.getDate();
        
        if (!workoutsByDay[day]) {
          workoutsByDay[day] = [];
        }
        
        // Only add if not already present (prevent duplicates)
        const exists = workoutsByDay[day].some(w => w.id === workout.id);
        if (!exists) {
          workoutsByDay[day].push(workout);
        }
      } catch (error) {
        console.error("Error processing workout date:", error);
      }
    }
    
    // Update state only if there's an actual change
    setScheduledWorkoutsByDay(prevState => {
      // Deep comparison to prevent unnecessary updates
      const isEqual = JSON.stringify(prevState) === JSON.stringify(workoutsByDay);
      return isEqual ? prevState : workoutsByDay;
    });
  }, [monthWorkouts]);
  
  // Check if a date has workouts scheduled
  const hasWorkout = (day: number) => {
    return scheduledWorkoutsByDay[day] && scheduledWorkoutsByDay[day].length > 0;
  };
  
  // Check if all workouts on a day are completed - only these days will be green
  // We now check both server status and our client tracking for more reliable results
  const isCompleted = (day: number) => {
    if (!scheduledWorkoutsByDay[day] || scheduledWorkoutsByDay[day].length === 0) {
      return false;
    }
    
    // Get the date string for this day
    const dateString = format(new Date(year, month, day), 'yyyy-MM-dd');
    
    // Check if all workouts for this day are completed by combining server and client state
    return scheduledWorkoutsByDay[day].every(workout => {
      // Check server-side status
      const serverCompleted = workout.isCompleted;
      
      // Check client-side status with our composite key tracking
      const clientCompleted = WorkoutCompletion.isCompleted(workout.id, dateString);
      
      // A workout is completed if either the server or client says it's completed
      return serverCompleted || clientCompleted;
    });
  };
  
  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };
  
  // Check if a date is selected
  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };
  
  return (
    <div>
      {/* Day names row */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((dayName) => (
          <div 
            key={dayName} 
            className="text-center text-xs text-gray-500 py-2"
          >
            {dayName}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: dayOfWeekAdjustment }, (_, i) => (
          <div key={`empty-${i}`} className="h-10"></div>
        ))}
        
        {/* Days of the month */}
        {days.map((day) => (
          <div key={day} className="relative">
            <button
              onClick={() => onSelectDate(new Date(year, month, day))}
              className={`h-10 w-10 flex items-center justify-center text-sm font-medium rounded-full transition-colors relative
                ${isSelected(day) ? 'bg-black text-white' : 'text-gray-800'}
                ${!isSelected(day) && isToday(day) ? 'border-2 border-gray-300' : ''}
                ${!isSelected(day) && hasWorkout(day) && isCompleted(day) ? 'bg-green-500 text-white' : ''}
                ${!isSelected(day) ? 'hover:bg-gray-100' : ''}
              `}
            >
              {day}
            </button>
            
            {/* No badge for multiple workouts */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;