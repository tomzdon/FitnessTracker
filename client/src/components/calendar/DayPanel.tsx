import { Plus, CheckCircle, Dumbbell, Calendar, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { WorkoutsStore } from "@/lib/workouts-store";

interface DayPanelProps {
  selectedDate: Date;
  workouts: any[];
}

const DayPanel = ({ selectedDate, workouts = [] }: DayPanelProps) => {
  const { toast } = useToast();
  
  const isToday = () => {
    const today = new Date();
    return (
      today.getDate() === selectedDate.getDate() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  // Get workout details for each scheduled workout
  const { data: workoutDetails = [] } = useQuery({
    queryKey: ['/api/workout-details', workouts.map(w => w.workoutId).join(',')],
    queryFn: async () => {
      if (workouts.length === 0) return [];
      
      // For each workout in the scheduled workouts, fetch the workout details
      const details = await Promise.all(
        workouts.map(async (sw) => {
          try {
            const res = await fetch(`/api/workouts/${sw.workoutId}`);
            if (!res.ok) return null;
            const workout = await res.json();
            return {
              ...workout,
              scheduledWorkoutId: sw.id,
              isCompleted: sw.isCompleted,
              programDay: sw.programDay
            };
          } catch (error) {
            console.error(`Failed to fetch workout ${sw.workoutId}:`, error);
            return null;
          }
        })
      );
      
      return details.filter(d => d !== null);
    },
    enabled: workouts.length > 0
  });
  
  // Mark workout as completed mutation - completely isolated for each unique workout instance
  const markCompletedMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number, isCompleted: boolean }) => {
      // Use the specific ID to mark just this one workout as completed
      const res = await apiRequest("PUT", `/api/scheduled-workouts/${id}/complete`, { 
        isCompleted,
        specificWorkoutId: id // Make sure only this exact workout instance is affected
      });
      return await res.json();
    },
    onSuccess: (data) => {
      const updatedWorkout = data.updatedWorkout;
      
      if (updatedWorkout) {
        console.log(`Updating workout ID: ${updatedWorkout.id} to isCompleted: ${updatedWorkout.isCompleted}`);
        
        // ONLY update this specific workout in current day view by exact ID
        const dateKey = selectedDate.toISOString().split('T')[0];
        const currentDayWorkouts = queryClient.getQueryData<any[]>(['/api/scheduled-workouts/date', dateKey]);
        
        if (currentDayWorkouts) {
          queryClient.setQueryData(['/api/scheduled-workouts/date', dateKey], 
            currentDayWorkouts.map(workout => {
              // STRICT EQUALITY check by ID to ensure only this specific workout is updated
              if (workout.id === updatedWorkout.id) {
                return updatedWorkout;
              }
              return workout;
            })
          );
        }
        
        // Update the workout details for this specific workout instance only
        const detailsKey = workouts.map(w => w.workoutId).join(',');
        const workoutDetails = queryClient.getQueryData<any[]>(['/api/workout-details', detailsKey]);
        
        if (workoutDetails) {
          queryClient.setQueryData(['/api/workout-details', detailsKey], 
            workoutDetails.map(workout => {
              // Only update this exact workout instance by scheduledWorkoutId
              if (workout.scheduledWorkoutId === updatedWorkout.id) {
                return { ...workout, isCompleted: updatedWorkout.isCompleted };
              }
              return workout;
            })
          );
        }
        
        // Update this specific workout instance in the month range by exact ID
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const startDate = monthStart.toISOString().split('T')[0];
        const endDate = monthEnd.toISOString().split('T')[0];
        
        const monthKey = ['/api/scheduled-workouts/range', startDate, endDate];
        const rangeWorkouts = queryClient.getQueryData<any[]>(monthKey);
        
        if (rangeWorkouts) {
          queryClient.setQueryData(monthKey, 
            rangeWorkouts.map(workout => {
              // STRICT ID MATCH for the specific workout instance
              if (workout.id === updatedWorkout.id) {
                return updatedWorkout;
              }
              return workout;
            })
          );
        }
      }
      
      const status = updatedWorkout && updatedWorkout.isCompleted ? 'completed' : 'marked as incomplete';
      toast({
        title: `Workout ${status}`,
        description: updatedWorkout && updatedWorkout.isCompleted 
          ? "Great job! Your progress has been updated." 
          : "Workout has been marked as incomplete",
      });
      
      // Update statistics and program progress while keeping workouts independent
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/active-program'] });
      queryClient.invalidateQueries({ queryKey: ['/api/completedWorkouts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update workout",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleToggleComplete = (id: number, currentStatus: boolean) => {
    markCompletedMutation.mutate({ id, isCompleted: !currentStatus });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-6">
        {isToday() ? "Today" : new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(selectedDate)}
      </h3>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="mb-4 p-4 rounded-full bg-gray-100">
            <Plus className="h-10 w-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No workouts for this day</h4>
          <p className="text-gray-500 text-sm mb-8">
            Enjoy your rest day or schedule a workout from a program.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {workoutDetails.map((workout: any) => (
            <div 
              key={workout.scheduledWorkoutId} 
              className={`border rounded-lg p-4 relative ${workout.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}`}
            >
              <h4 className="font-medium text-lg mb-2">{workout.title}</h4>
              
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-gray-700">
                    {workout.duration} minutes
                  </span>
                </div>
                
                <span className="text-gray-400">•</span>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                  <span className="text-gray-700">
                    Day {Math.max(1, workout.programDay || 1)}
                  </span>
                </div>
              </div>
              
              {workout.description && (
                <p className="text-sm text-gray-600 mb-3">{workout.description}</p>
              )}
              
              <div className="absolute top-4 right-4">
                <Button 
                  variant={workout.isCompleted ? "default" : "default"}
                  size="sm"
                  onClick={() => handleToggleComplete(workout.scheduledWorkoutId, workout.isCompleted)}
                  disabled={markCompletedMutation.isPending}
                  className={workout.isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                >
                  {markCompletedMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                      <span>Updating...</span>
                    </div>
                  ) : workout.isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Dumbbell className="h-4 w-4 mr-1" />
                      <span>Mark as Done</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DayPanel;