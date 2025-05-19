import { Plus, CheckCircle, Dumbbell, Calendar, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  
  // Mark workout as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number, isCompleted: boolean }) => {
      const res = await apiRequest("PUT", `/api/scheduled-workouts/${id}/complete`, { isCompleted });
      return await res.json();
    },
    onSuccess: (data) => {
      const status = data.completedWorkout ? 'completed' : 'marked as incomplete';
      toast({
        title: `Workout ${status}`,
        description: data.completedWorkout 
          ? "Great job! Your progress has been updated." 
          : "Workout has been marked as incomplete",
      });
      
      // Invalidate all relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-workouts/date'] });
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
                    Day {workout.programDay || 1}
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