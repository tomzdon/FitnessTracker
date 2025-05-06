import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Dumbbell, Clock, RefreshCcw, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FavoriteButton } from '@/components/workouts/FavoriteButton';

export function FavoriteWorkouts() {
  // Define workout type
  interface Workout {
    id: number;
    title: string;
    description: string;
    type: string;
    difficulty: string;
    duration: number;
    imageUrl?: string;
  }
  
  // Fetch favorites
  const { data: favorites = [], isLoading, isError, error } = useQuery<Workout[]>({
    queryKey: ['/api/favourites'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Favorites</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive mb-4">
          <RefreshCcw className="h-10 w-10 mx-auto" />
        </div>
        <h3 className="text-lg font-medium mb-2">Error loading favorites</h3>
        <p className="text-muted-foreground mb-4">{(error as Error)?.message || "Something went wrong"}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Bookmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Favorites</h2>
        </div>
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-4">Mark workouts as favorites to see them here.</p>
            <Button asChild variant="outline">
              <Link href="/discover">Browse Workouts</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Your Favorites</h2>
        </div>
        <p className="text-sm text-muted-foreground">{favorites.length} saved</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((workout: Workout) => {
          const handleRemove = () => {
            // This is just a placeholder to help with state management
            // The actual removal happens in the FavoriteButton component
          };
          
          return (
            <Card key={workout.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{workout.title}</CardTitle>
                  <FavoriteButton 
                    workoutId={workout.id} 
                    isFavorite={true} 
                  />
                </div>
                <CardDescription>{workout.type}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-2">{workout.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{workout.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span>{workout.difficulty}</span>
                </div>
                <Button 
                  asChild 
                  size="sm" 
                  variant="outline"
                >
                  <Link href={`/workouts/${workout.id}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}