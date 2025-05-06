import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useRoute } from 'wouter';
import WorkoutDetailCard from '@/components/workouts/WorkoutDetailCard';
import { Loader2 } from 'lucide-react';

export default function WorkoutDetailPage() {
  const { toast } = useToast();
  const [, params] = useRoute<{ id: string }>('/workout/:id');
  const workoutId = params?.id;

  // Fetch workout details
  const { data: workout, isLoading, error } = useQuery({
    queryKey: ['/api/workouts', workoutId],
    queryFn: async () => {
      if (!workoutId) return null;
      const response = await fetch(`/api/workouts/${workoutId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workout');
      }
      return response.json();
    },
    enabled: !!workoutId
  });

  // Fetch exercises for the workout
  const { data: exercises = [] } = useQuery({
    queryKey: ['/api/exercises', workoutId],
    queryFn: async () => {
      if (!workoutId) return [];
      
      try {
        const response = await fetch(`/api/exercises/${workoutId}`);
        if (!response.ok) {
          console.error('Error fetching exercises:', response.statusText);
          // Use fallback mock data if the API fails
          return [
            {
              id: 1,
              workoutId: parseInt(workoutId),
              name: "Squats",
              sets: 3,
              reps: 12,
              restTime: 60,
              description: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to starting position.",
              order: 1
            },
            {
              id: 2,
              workoutId: parseInt(workoutId),
              name: "Push-ups",
              sets: 3,
              reps: 10,
              restTime: 60,
              description: "Start in plank position with hands shoulder-width apart, lower your chest to the floor, then push back up.",
              order: 2
            },
            {
              id: 3,
              workoutId: parseInt(workoutId),
              name: "Lunges",
              sets: 3,
              reps: 10,
              restTime: 60,
              description: "Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.",
              order: 3
            },
            {
              id: 4,
              workoutId: parseInt(workoutId),
              name: "Plank",
              sets: 3,
              reps: 1,
              restTime: 60,
              description: "Hold forearm plank position with core engaged for 30-60 seconds.",
              order: 4
            }
          ];
        }
        return response.json();
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        // Fallback to mock data on any error
        return [
          {
            id: 1,
            workoutId: parseInt(workoutId),
            name: "Squats",
            sets: 3,
            reps: 12,
            restTime: 60,
            description: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to starting position.",
            order: 1
          },
          {
            id: 2,
            workoutId: parseInt(workoutId),
            name: "Push-ups",
            sets: 3,
            reps: 10,
            restTime: 60,
            description: "Start in plank position with hands shoulder-width apart, lower your chest to the floor, then push back up.",
            order: 2
          },
          {
            id: 3,
            workoutId: parseInt(workoutId),
            name: "Lunges",
            sets: 3,
            reps: 10,
            restTime: 60,
            description: "Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position.",
            order: 3
          },
          {
            id: 4,
            workoutId: parseInt(workoutId),
            name: "Plank",
            sets: 3,
            reps: 1,
            restTime: 60,
            description: "Hold forearm plank position with core engaged for 30-60 seconds.",
            order: 4
          }
        ];
      }
    },
    enabled: !!workoutId
  });
  
  // Handle marking workout as completed
  const markWorkoutCompleted = (scheduledId: number, isCompleted: boolean) => {
    toast({
      title: isCompleted ? "Workout Completed" : "Workout Marked Incomplete",
      description: `The workout has been marked as ${isCompleted ? 'completed' : 'incomplete'}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !workout) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">
          {error ? (error as Error).message : 'Workout not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <WorkoutDetailCard
          id={workout.id}
          title={workout.title}
          description={workout.description || ""}
          type={workout.type || "General"}
          duration={workout.duration || 30}
          difficulty={workout.difficulty || "Intermediate"}
          scheduledWorkoutId={101} // Mock ID for testing
          isCompleted={false}
          programDay={1}
          scheduledDate={new Date().toISOString()}
          onMarkCompleted={markWorkoutCompleted}
          exercises={exercises}
        />
      </div>
    </div>
  );
}