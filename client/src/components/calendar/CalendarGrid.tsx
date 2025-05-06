import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth, endOfMonth, format } from "date-fns";

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
  
  // Organize scheduled workouts by day
  useEffect(() => {
    const workoutsByDay: Record<number, ScheduledWorkout[]> = {};
    
    monthWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.scheduledDate);
      const day = workoutDate.getDate();
      
      if (!workoutsByDay[day]) {
        workoutsByDay[day] = [];
      }
      
      workoutsByDay[day].push(workout);
    });
    
    setScheduledWorkoutsByDay(workoutsByDay);
  }, [monthWorkouts]);
  
  // All days should appear to have workouts scheduled (filled green)
  const hasWorkout = (day: number) => {
    return true; // Always return true to make all days green
  };
  
  // We don't need completion status distinction anymore
  const isCompleted = (day: number) => {
    return false;
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
                ${!isSelected(day) && hasWorkout(day) ? 'bg-green-100' : ''}
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