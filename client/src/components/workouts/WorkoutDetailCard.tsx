import { useState } from 'react';
import { CheckCircle, Loader2, Dumbbell, Clock, CalendarDays, UserCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { type Exercise } from '@shared/schema';

// Local exercise interface that extends the schema one with any additional properties we need
interface WorkoutExercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  weight?: string | number | null;
  description?: string;
  order?: number; // Optional property
}

interface WorkoutDetailCardProps {
  id: number;
  title: string;
  description: string;
  type: string;
  duration: number;
  difficulty: string;
  scheduledWorkoutId?: number;
  isCompleted?: boolean;
  programDay?: number;
  scheduledDate?: string;
  onMarkCompleted?: (scheduledId: number, isCompleted: boolean) => void;
  exercises?: WorkoutExercise[];
}

export default function WorkoutDetailCard({
  id,
  title,
  description,
  type,
  duration,
  difficulty,
  scheduledWorkoutId,
  isCompleted = false,
  programDay,
  scheduledDate,
  onMarkCompleted,
  exercises = []
}: WorkoutDetailCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Auto-expand exercise list if we have actual exercises from the database
  const [isExercisesOpen, setIsExercisesOpen] = useState(exercises.length > 0);
  const [completedSets, setCompletedSets] = useState<Record<number, Set<number>>>({});
  
  const markSetCompleted = (exerciseId: number, setIndex: number) => {
    setCompletedSets(prev => {
      const newCompletedSets = { ...prev };
      if (!newCompletedSets[exerciseId]) {
        newCompletedSets[exerciseId] = new Set();
      }
      
      // Toggle set completion status
      const exerciseSets = new Set(newCompletedSets[exerciseId]);
      if (exerciseSets.has(setIndex)) {
        exerciseSets.delete(setIndex);
      } else {
        exerciseSets.add(setIndex);
      }
      
      newCompletedSets[exerciseId] = exerciseSets;
      return newCompletedSets;
    });
    
    // Show toast notification
    toast({
      title: `Set ${setIndex + 1} tracked`,
      description: `Your progress has been updated.`,
    });
  };
  
  const isSetCompleted = (exerciseId: number, setIndex: number) => {
    return completedSets[exerciseId]?.has(setIndex) || false;
  };
  
  const markCompletedMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: number, isCompleted: boolean }) => {
      const response = await fetch(`/api/scheduled-workouts/${id}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update workout');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const status = data.isCompleted ? 'completed' : 'marked as incomplete';
      toast({
        title: `Workout ${status}`,
        description: data.isCompleted 
          ? "Great job! Your progress has been updated." 
          : "Workout has been marked as incomplete",
      });
      
      // Invalidate all relevant queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-workouts/date'] });
      queryClient.invalidateQueries({ queryKey: ['/api/scheduled-workouts/range'] });
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

  const handleToggleComplete = () => {
    if (scheduledWorkoutId) {
      if (onMarkCompleted) {
        onMarkCompleted(scheduledWorkoutId, !isCompleted);
      } else {
        markCompletedMutation.mutate({ 
          id: scheduledWorkoutId, 
          isCompleted: !isCompleted 
        });
      }
    }
  };

  const defaultExercises: WorkoutExercise[] = [
    {
      id: 1,
      name: "Squats",
      sets: 3,
      reps: 12,
      restTime: 60,
      weight: "70",
      description: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then return to starting position."
    },
    {
      id: 2,
      name: "Push-ups",
      sets: 3,
      reps: 10,
      restTime: 60,
      weight: null,
      description: "Start in plank position with hands shoulder-width apart, lower your chest to the floor, then push back up."
    },
    {
      id: 3,
      name: "Lunges",
      sets: 3,
      reps: 10,
      restTime: 60,
      weight: "20",
      description: "Step forward with one leg, lower your body until both knees are bent at 90 degrees, then return to starting position."
    },
    {
      id: 4,
      name: "Plank",
      sets: 3,
      reps: 1,
      restTime: 60,
      weight: null,
      description: "Hold forearm plank position with core engaged for 30-60 seconds."
    }
  ];

  // Use provided exercises or fall back to default exercises if empty
  const displayExercises = exercises.length > 0 ? exercises : defaultExercises;

  return (
    <Card className={`overflow-hidden ${isCompleted ? 'border-green-200' : ''}`}>
      <CardHeader className={`pb-3 ${isCompleted ? 'bg-green-50' : ''}`}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center text-xl">
              {isCompleted && <CheckCircle className="h-5 w-5 mr-2 text-green-600" />}
              {title}
            </CardTitle>
            <CardDescription className="mt-1">
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                <Badge variant="outline" className="font-normal">
                  <Dumbbell className="h-3.5 w-3.5 mr-1" />
                  {type}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {duration} min
                </Badge>
                <Badge variant="outline" className="font-normal">
                  <UserCircle2 className="h-3.5 w-3.5 mr-1" />
                  {difficulty}
                </Badge>
                {programDay && (
                  <Badge variant="outline" className="font-normal">
                    <CalendarDays className="h-3.5 w-3.5 mr-1" />
                    Day {programDay}
                  </Badge>
                )}
              </div>
            </CardDescription>
          </div>
          
          {scheduledWorkoutId && (
            <Button 
              size="sm"
              variant={isCompleted ? "outline" : "default"}
              onClick={handleToggleComplete}
              disabled={markCompletedMutation.isPending}
              className={isCompleted 
                ? 'border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800' 
                : ''}
            >
              {markCompletedMutation.isPending ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  <span>Updating...</span>
                </div>
              ) : isCompleted ? (
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
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
      
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-lg font-semibold">Exercises</h3>
      </div>
      
      <Collapsible
        open={isExercisesOpen}
        onOpenChange={setIsExercisesOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild className="hidden">
          <Button 
            variant="ghost" 
            className="w-full flex justify-between py-2 rounded-none"
          >
            <span className="font-medium">Exercise List ({displayExercises.length})</span>
            {isExercisesOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {displayExercises.map((exercise, index) => (
              <div key={exercise.id} className="rounded-lg border overflow-hidden">
                <div className="px-4 py-3 bg-white flex justify-between items-center">
                  <div className="flex items-center">
                    <h4 className="font-semibold text-base">{exercise.name}</h4>
                    <div className="ml-3 text-gray-500 text-sm font-medium">
                      {index + 1}/{displayExercises.length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {exercise.sets} sets × {exercise.reps} {exercise.reps === 1 ? 'rep' : 'reps'}
                      {exercise.weight ? ` (${exercise.weight}kg)` : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      Rest: {exercise.restTime} sec
                    </div>
                  </div>
                </div>
                
                {exercise.description && (
                  <div className="px-4 py-2 bg-gray-50 border-y text-sm text-gray-600">
                    {exercise.description}
                  </div>
                )}
                
                <div className="px-4 py-3 flex justify-between items-center">
                  <div className="flex space-x-2">
                    {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                      <Button 
                        key={setIndex} 
                        variant={isSetCompleted(exercise.id, setIndex) ? "default" : "outline"}
                        size="sm" 
                        className={`h-8 w-8 p-0 ${isSetCompleted(exercise.id, setIndex) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => markSetCompleted(exercise.id, setIndex)}
                      >
                        {setIndex + 1}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="text-sm font-medium">
                    {completedSets[exercise.id]?.size || 0}/{exercise.sets}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <CardFooter className="flex justify-between pt-3 bg-gray-50">
        {scheduledDate ? (
          <span className="text-xs text-gray-500">
            Scheduled for: {new Date(scheduledDate).toLocaleDateString()}
          </span>
        ) : (
          <span></span>
        )}
        
        {scheduledWorkoutId && (
          <Badge variant="outline" className={`ml-auto ${isCompleted ? 'bg-green-50 text-green-700 border-green-200' : ''}`}>
            {isCompleted ? "Completed" : "Scheduled"}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
}