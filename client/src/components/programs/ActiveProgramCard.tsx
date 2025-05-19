import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Play, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function ActiveProgramCard() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch active program z wymuszeniem ponownego pobrania po każdej zmianie
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/active-program"],
    queryFn: async () => {
      console.log('Pobieranie danych aktywnego programu...');
      // Dodajemy znacznik czasu, aby uniknąć pamięci podręcznej przeglądarki
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/active-program?_t=${timestamp}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch active program');
      const result = await res.json();
      console.log('Pobrane dane programu:', result);
      return result;
    },
    // Wyłączamy cache i wymuszamy odświeżanie
    refetchOnWindowFocus: true,
    refetchOnMount: 'always', // Zawsze pobieraj dane przy montowaniu komponentu
    staleTime: 0,           // Zawsze traktujemy dane jako nieaktualne
    cacheTime: 0,           // Nie przechowuj danych w pamięci podręcznej
  });
  
  // Mark workout as completed mutation
  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const res = await apiRequest("POST", "/api/completedWorkouts", { workoutId });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Workout completed",
        description: "Your progress has been updated!",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to mark workout as completed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update program progress mutation
  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, currentDay, isActive, completedAt }: { 
      id: number, 
      currentDay: number,
      isActive?: boolean,
      completedAt?: string 
    }) => {
      const res = await apiRequest("PUT", `/api/user-programs/${id}`, { 
        currentDay, 
        isActive, 
        completedAt 
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Program progress updated",
        description: "You've moved to the next day!",
      });
      
      // Bardziej agresywne odświeżanie wszystkich danych programu
      queryClient.invalidateQueries({ queryKey: ["/api/active-program"] });
      
      // Wymuszamy pełne odświeżenie strony głównej po zmianie postępu programu
      queryClient.invalidateQueries({ queryKey: ["/api/user-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      // Wywołujemy refetch, aby upewnić się, że dane są aktualne
      setTimeout(() => {
        refetch();
      }, 300);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update program progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Unsubscribe from program mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async (userProgramId: number) => {
      const res = await apiRequest("POST", `/api/user-programs/${userProgramId}/unsubscribe`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Unsubscribed from program",
        description: "You have successfully unsubscribed from the program",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/active-program"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-workouts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to unsubscribe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle viewing program details
  const handleViewProgram = () => {
    if (data && data.program) {
      navigate(`/programs/${data.program.id}`);
    }
  };
  
  // Handle unsubscribe
  const handleUnsubscribe = () => {
    if (!data || !data.userProgram) return;
    unsubscribeMutation.mutate(data.userProgram.id);
  };
  
  // Handle completing today's workout and advancing to next day
  const handleCompleteWorkout = () => {
    if (!data) return;
    
    const { userProgram, workouts } = data;
    const currentDayWorkout = workouts.find((w: any) => w.day === userProgram.currentDay);
    
    if (currentDayWorkout) {
      completeWorkoutMutation.mutate(currentDayWorkout.id, {
        onSuccess: () => {
          // If not the last day, advance to next day
          if (userProgram.currentDay < data.program.duration) {
            const nextDay = userProgram.currentDay + 1;
            updateProgramMutation.mutate({ 
              id: userProgram.id, 
              currentDay: nextDay 
            });
          } else {
            // Complete the program if it's the last day
            updateProgramMutation.mutate({ 
              id: userProgram.id, 
              currentDay: userProgram.currentDay,
              completedAt: new Date().toISOString(),
              isActive: false
            });
          }
        }
      });
    } else {
      toast({
        title: "No workout found",
        description: "There's no workout scheduled for today.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <span>Your Active Program</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  // Fallback for when there's an error or no data
  if (error || !data) {
    // Return a card that prompts to browse programs
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Active Program</CardTitle>
          <CardDescription>You don't have an active program</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Find a program that fits your goals and start your journey!</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate("/discover")}>Browse Programs</Button>
        </CardFooter>
      </Card>
    );
  }

  // If no active program
  if (!data.program) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Your Active Program</CardTitle>
          <CardDescription>You don't have an active program</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Find a program that fits your goals and start your journey!</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => navigate("/discover")}>Browse Programs</Button>
        </CardFooter>
      </Card>
    );
  }
  
  const { userProgram, program, workouts } = data;
  
  // Obliczamy postęp na podstawie liczby ukończonych dni
  // Jeśli jesteśmy na pierwszym dniu, postęp wynosi 0
  // W przeciwnym razie obliczamy procent ukończenia na podstawie dni
  console.log(`Obliczanie postępu programu: dzień ${userProgram.currentDay} z ${program.duration}`);
  const progress = userProgram.currentDay <= 1 ? 0 : ((userProgram.currentDay - 1) / program.duration) * 100;
  
  // Logujemy obliczony postęp, aby sprawdzić czy wartości są poprawne
  console.log(`Obliczony postęp: ${progress.toFixed(2)}%`);
  const currentDayWorkout = workouts.find((w: any) => w.day === userProgram.currentDay);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{program.title}</span>
          <Button variant="ghost" size="sm" onClick={handleViewProgram}>
            View Program
          </Button>
        </CardTitle>
        <CardDescription>
          Day {userProgram.currentDay} of {program.duration}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {currentDayWorkout ? (
          <div className="bg-gray-50 border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{currentDayWorkout.title}</h3>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <CalendarDays className="h-3.5 w-3.5 mr-1" />
                  <span>Day {currentDayWorkout.day}</span>
                  <span className="mx-1">•</span>
                  <span>{currentDayWorkout.duration} min</span>
                </div>
              </div>
            </div>
            {currentDayWorkout.description && (
              <p className="text-sm text-gray-600 mt-2">{currentDayWorkout.description}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No workout scheduled for day {userProgram.currentDay}.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {currentDayWorkout && (
          <Button 
            className="w-full" 
            onClick={handleCompleteWorkout}
            disabled={completeWorkoutMutation.isPending || updateProgramMutation.isPending}
          >
            {(completeWorkoutMutation.isPending || updateProgramMutation.isPending) ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Complete Today's Workout
          </Button>
        )}
        
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleUnsubscribe}
          disabled={unsubscribeMutation.isPending}
        >
          {unsubscribeMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : "Unsubscribe from Program"}
        </Button>
      </CardFooter>
    </Card>
  );
}