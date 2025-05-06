import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Calendar, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export default function ProgramDetailPage() {
  // Route params
  const [match, params] = useRoute<{ id: string }>("/programs/:id");
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const programId = params?.id;

  // Fetch program details
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/programs", programId],
    queryFn: () => fetch(`/api/programs/${programId}`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch program');
      return res.json();
    }),
    enabled: !!programId,
  });

  // Active program query
  const activeProgram = useQuery({
    queryKey: ["/api/active-program"],
    queryFn: async () => {
      const res = await fetch('/api/active-program');
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch active program');
      return res.json();
    },
    enabled: !!user,
  });

  // Assign program mutation
  const assignProgramMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/programs/${programId}/assign`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Program assigned",
        description: "You've successfully started this program!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/active-program"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign program",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check if this program is the active one
  const isProgramActive = activeProgram.data && 
    activeProgram.data.program && 
    activeProgram.data.program.id === parseInt(programId || "0");

  // Handle back button
  const handleBack = () => {
    navigate("/discover");
  };

  // Handle assign program
  const handleAssignProgram = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to assign this program",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    assignProgramMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Program not found</h1>
          <p className="text-gray-500 mt-2">The program you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-6" onClick={handleBack}>
            Back to Discover
          </Button>
        </div>
      </div>
    );
  }

  const { program, workouts } = data;

  return (
    <div className="container mx-auto px-4 py-6">
      <Button variant="ghost" className="mb-4" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Program Details */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="relative pb-0">
              <div 
                className="w-full h-48 rounded-t-lg bg-cover bg-center" 
                style={{ 
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${program.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'})`
                }}
              >
                <div className="absolute bottom-4 left-6 text-white">
                  <div className="inline-block bg-white text-black text-xs font-bold px-2 py-1 rounded-full mb-2">
                    {program.duration} DAYS
                  </div>
                  <h1 className="text-3xl font-bold">{program.title}</h1>
                  <p className="text-gray-200 text-sm mt-1">{program.difficulty} • {program.category || 'General'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <p>{program.description || 'No description available for this program.'}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm text-gray-500">{program.duration} days program</span>
              </div>
              
              {!isProgramActive ? (
                <Button 
                  onClick={handleAssignProgram}
                  disabled={assignProgramMutation.isPending}
                >
                  {assignProgramMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Start Program
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Currently Active
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        {/* Program Stats */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Program Stats</CardTitle>
              <CardDescription>Overview of this training program</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Difficulty</span>
                  <span className="font-medium">{program.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{program.duration} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Workouts</span>
                  <span className="font-medium">{workouts.length}</span>
                </div>
                {isProgramActive && activeProgram.data && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Progress</span>
                    <span className="font-medium">Day {activeProgram.data.userProgram.currentDay} of {program.duration}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Program Workouts */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Program Workouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.length > 0 ? (
            workouts.map((workout: any) => (
              <Card key={workout.id} className="overflow-hidden">
                <div 
                  className="h-40 w-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${workout.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'})` 
                  }}
                >
                  <div className="p-4 text-white h-full flex flex-col justify-between">
                    <div className="flex justify-between">
                      <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
                        DAY {workout.day || '?'}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{workout.title}</h3>
                      <div className="flex items-center mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{workout.duration} MIN</span>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <p className="text-sm text-gray-500">{workout.description || 'No description available.'}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No workouts available for this program.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}