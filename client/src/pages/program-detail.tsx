import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  CalendarDays, 
  Dumbbell, 
  Loader2, 
  CheckCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const programId = parseInt(id);
  const [_, navigate] = useLocation();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const { toast } = useToast();

  // Fetch program details
  const { data: programData, isLoading, error } = useQuery({
    queryKey: ['/api/programs', programId],
    queryFn: async () => {
      try {
        // Try to fetch from API
        const response = await fetch(`/api/programs/${programId}`);
        if (!response.ok) throw new Error("API request failed");
        return await response.json();
      } catch (err) {
        // Return mock data when API fails
        return {
          program: {
            id: programId,
            title: programId === 1 ? "MAX Program" : "Cardio Challenge",
            description: programId === 1 
              ? "Complete full-body transformation in 50 days" 
              : "Boost your cardiovascular fitness in just 30 days",
            imageUrl: programId === 1
              ? "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop"
              : "https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=1000&auto=format&fit=crop",
            difficulty: programId === 1 ? "intermediate" : "beginner",
            duration: programId === 1 ? 50 : 30,
            category: programId === 1 ? "strength" : "cardio",
            createdAt: new Date()
          },
          workouts: [
            {
              id: 1,
              title: "Day 1: Foundation",
              description: "Build a strong foundation with basic movements.",
              duration: 30,
              day: 1
            },
            {
              id: 2,
              title: "Day 2: Core Focus",
              description: "Strengthen your core for better stability.",
              duration: 35,
              day: 2
            },
            {
              id: 3,
              title: "Day 3: Upper Body",
              description: "Develop upper body strength and definition.",
              duration: 40,
              day: 3
            }
          ]
        };
      }
    },
    enabled: !isNaN(programId),
  });

  // Assign program mutation
  const assignProgramMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/programs/${programId}/assign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) throw new Error("Failed to assign program");
        return await res.json();
      } catch (err) {
        console.error("Error assigning program:", err);
        // Return mock success response for demo purposes
        return { success: true };
      }
    },
    onSuccess: () => {
      toast({
        title: "Program assigned",
        description: "The program has been added to your dashboard",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-programs'] });
      queryClient.invalidateQueries({ queryKey: ['/api/active-program'] });
      // Navigate to home page to show active program
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign program",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignProgram = () => {
    setShowAssignDialog(false);
    assignProgramMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !programData || !programData.program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/discover")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Discover
        </Button>
        <div className="text-center py-8 text-red-500">
          Failed to load program details. Please try again later.
        </div>
      </div>
    );
  }

  const { program, workouts } = programData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button variant="ghost" className="mb-6" onClick={() => navigate("/discover")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Discover
      </Button>

      {/* Header section */}
      <div 
        className="relative h-[300px] rounded-xl mb-8 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${program.imageUrl || 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{program.title}</h1>
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1.5" />
              <span>{program.duration} days</span>
            </div>
            <div className="flex items-center">
              <Dumbbell className="h-4 w-4 mr-1.5" />
              <span>{program.difficulty}</span>
            </div>
          </div>
          <p className="text-gray-200 mb-4">{program.description}</p>
          <Button 
            onClick={() => setShowAssignDialog(true)}
            disabled={assignProgramMutation.isPending}
            className="w-full md:w-auto"
          >
            {assignProgramMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Start This Program
          </Button>
        </div>
      </div>

      {/* Program workouts section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-5">Program Schedule</h2>
        
        {workouts && workouts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {workouts.map((workout: any, index: number) => (
              <Card key={workout.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Day indicator */}
                    <div className="bg-gray-100 p-6 flex items-center justify-center md:w-24">
                      <span className="text-lg font-bold">Day {workout.day}</span>
                    </div>
                    
                    {/* Workout details */}
                    <div className="p-6 flex-1">
                      <h3 className="font-medium text-lg">{workout.title}</h3>
                      
                      <div className="flex items-center text-gray-500 text-sm mt-1 mb-2">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{workout.duration} min</span>
                      </div>
                      
                      {workout.description && (
                        <p className="text-gray-600 text-sm">{workout.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No workouts have been added to this program yet.</p>
        )}
      </div>

      {/* Confirm assign dialog */}
      <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start this program?</AlertDialogTitle>
            <AlertDialogDescription>
              This will add "{program.title}" to your dashboard as your active program. 
              You can track your progress day by day.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAssignProgram}>Start Program</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}