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
    onSuccess: () => {
      toast({
        title: "Workout status updated",
        description: "Your workout status has been updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-workouts/date'] });
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
            <div key={workout.scheduledWorkoutId} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium">{workout.title}</h4>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{workout.duration} minutes</span>
                    {workout.programDay && (
                      <>
                        <span className="mx-1">•</span>
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>Day {workout.programDay}</span>
                      </>
                    )}
                  </div>
                </div>
                <Button 
                  variant={workout.isCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleComplete(workout.scheduledWorkoutId, workout.isCompleted)}
                  disabled={markCompletedMutation.isPending}
                >
                  {workout.isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <Dumbbell className="h-4 w-4 mr-1" />
                      <span>Mark as Done</span>
                    </>
                  )}
                </Button>
              </div>
              {workout.description && (
                <p className="text-sm text-gray-600">{workout.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DayPanel;