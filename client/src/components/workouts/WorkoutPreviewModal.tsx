import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Workout } from "@shared/schema";
import { FavoriteButton } from "@/components/workouts/FavoriteButton";
import { useQuery } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface WorkoutPreviewModalProps {
  workout: {
    id: string | number;
    type: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    duration?: number;
    day?: number;
    totalDays?: number;
    description?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkout?: () => void;
}

export function WorkoutPreviewModal({ 
  workout, 
  isOpen, 
  onClose,
  onStartWorkout 
}: WorkoutPreviewModalProps) {
  if (!workout) return null;
  
  // Check if this workout is already a favorite
  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ['/api/favourites'],
  });
  
  // Extract the numeric ID from the workout.id (which could be a string like "workout-5")
  const workoutId = typeof workout.id === 'string' && workout.id.includes('-') 
    ? parseInt(workout.id.split('-')[1]) 
    : Number(workout.id);
  
  // Fetch exercises for this workout
  const { data: exercises, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['/api/exercises', workoutId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/exercises/${workoutId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch exercises');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching exercises:', error);
        return [];
      }
    },
    enabled: isOpen && !!workoutId,
  });
  
  // Check if this workout is in favorites
  const isFavorite = favorites.some(favorite => favorite.id === workoutId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{workout.title}</DialogTitle>
          {workout.subtitle && (
            <DialogDescription className="text-sm text-muted-foreground">
              {workout.subtitle}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="mt-4">
          {/* Workout Image */}
          <div className="relative w-full h-60 rounded-lg overflow-hidden mb-6">
            <img 
              src={workout.imageUrl} 
              alt={workout.title} 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay with workout info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <div className="flex justify-between items-center">
                <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                  {workout.type === 'program' ? 'PROGRAM' : 
                  workout.day && workout.totalDays ? `DAY ${workout.day}/${workout.totalDays}` : 
                  'WORKOUT'}
                </div>
                
                {workout.duration && (
                  <div className="flex items-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{workout.duration} MIN</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Workout Description */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Description</h3>
              <p className="text-sm text-muted-foreground">
                {workout.description || 
                 "This dynamic workout combines strength and cardio exercises for a full-body burn. Perfect for all fitness levels with modifications provided throughout."}
              </p>
            </div>
            
            {/* Exercises List */}
            <div className="py-4">
              <h3 className="text-sm font-medium mb-2">Exercises</h3>
              
              {isLoadingExercises ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                </div>
              ) : exercises && exercises.length > 0 ? (
                <div className="space-y-2">
                  {exercises.map((exercise: { id: number, name: string, sets: number, reps: number, weight?: string | number }, index: number) => (
                    <motion.div 
                      key={exercise.id || index}
                      className="p-3 border rounded-md"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {exercise.sets} sets × {exercise.reps} reps {exercise.weight ? `(${exercise.weight}kg)` : ''}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {index + 1}/{exercises.length}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-sm text-muted-foreground">
                  No exercises found. View full details to see more.
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <FavoriteButton 
                workoutId={workoutId}
                isFavorite={isFavorite}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => {
                onClose();
                window.location.href = `/workouts/${workoutId}`;
              }}>
                View Details
              </Button>
              <Button onClick={() => {
                onClose();
                window.location.href = `/workouts/${workoutId}`;
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Workout
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}