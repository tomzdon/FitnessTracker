import { useState, useEffect } from 'react';
import { format, getDaysInMonth, startOfMonth, endOfMonth, addDays } from 'date-fns';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayPanel from '@/components/calendar/DayPanel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the current month and selected date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableWorkouts, setAvailableWorkouts] = useState<any[]>([]);

  // Get month and year for display
  const monthYear = format(currentDate, 'MMMM');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Fetch all workouts and automatically fill calendar
  useEffect(() => {
    const fetchWorkoutsAndFillCalendar = async () => {
      try {
        // First, fetch all available workouts
        const response = await fetch('/api/workouts');
        if (response.ok) {
          const workouts = await response.json();
          setAvailableWorkouts(workouts);
          
          // If workouts are available, automatically fill the calendar
          if (workouts.length > 0) {
            // Get the number of days in the current month
            const daysInMonth = getDaysInMonth(new Date(year, month));
            const firstDayOfMonth = startOfMonth(new Date(year, month));
            
            // Check if we already have data for this month
            const start = startOfMonth(new Date(year, month));
            const end = endOfMonth(new Date(year, month));
            const startDate = format(start, 'yyyy-MM-dd');
            const endDate = format(end, 'yyyy-MM-dd');
            
            const existingDataResponse = await fetch(`/api/scheduled-workouts/range/${startDate}/${endDate}`);
            if (existingDataResponse.ok) {
              const existingWorkouts = await existingDataResponse.json();
              
              // Only auto-fill if we don't already have a good number of workouts scheduled
              if (existingWorkouts.length < daysInMonth / 2) {
                console.log('Auto-filling calendar with workouts');
                await fillCalendar();
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch workouts or fill calendar:', error);
      }
    };
    
    fetchWorkoutsAndFillCalendar();
  }, [year, month]);

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  // Schedule workout mutation
  const scheduleWorkoutMutation = useMutation({
    mutationFn: async (workoutData: {
      workoutId: number;
      scheduledDate: string;
      programId?: number;
      programDay?: number;
    }) => {
      const response = await fetch('/api/scheduled-workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutId: workoutData.workoutId,
          scheduledDate: workoutData.scheduledDate,
          programId: workoutData.programId || 1, // Using a default program ID
          programDay: workoutData.programDay || 1, // Using a default program day
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule workout');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the relevant queries to refetch the data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/scheduled-workouts/date']
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to schedule workout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Function to fill the calendar with workouts for the current month
  const fillCalendar = async () => {
    if (availableWorkouts.length === 0) {
      toast({
        title: 'No workouts available',
        description: 'Please add workouts to your library first',
        variant: 'destructive',
      });
      return;
    }
    
    // Get the number of days in the current month
    const daysInMonth = getDaysInMonth(new Date(year, month));
    const firstDayOfMonth = startOfMonth(new Date(year, month));
    
    // Schedule a workout for each day of the month
    const schedulePromises = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Get a random workout from the available workouts
      const randomWorkout = availableWorkouts[Math.floor(Math.random() * availableWorkouts.length)];
      const currentDate = addDays(firstDayOfMonth, day - 1);
      
      // Format date for the API request
      const formattedDate = currentDate.toISOString().split('T')[0];
      
      schedulePromises.push(
        scheduleWorkoutMutation.mutateAsync({
          workoutId: randomWorkout.id,
          scheduledDate: formattedDate,
          programDay: day,
        })
      );
    }
    
    try {
      await Promise.all(schedulePromises);
      toast({
        title: 'Calendar filled',
        description: `Scheduled workouts for all ${daysInMonth} days in ${monthYear}`,
      });
      
      // Refresh the calendar data
      queryClient.invalidateQueries({ 
        queryKey: ['/api/scheduled-workouts/date'] 
      });
    } catch (error) {
      toast({
        title: 'Failed to fill calendar',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  // Query for scheduled workouts on the selected date
  const { data: dayWorkouts = [] } = useQuery<any[]>({
    queryKey: ['/api/scheduled-workouts/date', selectedDate.toISOString().split('T')[0]],
    // Function to fetch scheduled workouts for the selected date
    queryFn: async ({ queryKey }) => {
      const [_path, date] = queryKey;
      // Use the correct API endpoint for scheduled workouts
      const response = await fetch(`/api/scheduled-workouts/date/${date}`);
      
      // If not authenticated, return empty array
      if (response.status === 401) {
        return [];
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled workouts');
      }
      
      return response.json();
    },
    // Enable the query only if the user is authenticated
    enabled: true
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar section - 3 columns on large screens */}
        <div className="lg:col-span-3 bg-white rounded-lg p-6 shadow-sm">
          <CalendarHeader 
            month={monthYear} 
            year={year} 
            onPrevMonth={goToPreviousMonth} 
            onNextMonth={goToNextMonth} 
          />
          
          <CalendarGrid 
            year={year} 
            month={month} 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </div>
        
        {/* Day panel - 1 column on large screens */}
        <div className="lg:col-span-1">
          <DayPanel 
            selectedDate={selectedDate} 
            workouts={dayWorkouts} 
          />
        </div>
      </div>
    </div>
  );
}
