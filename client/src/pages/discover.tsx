import { useState } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Program, Workout } from '@shared/schema';
import { WorkoutPreviewCard } from '@/components/workouts/WorkoutPreviewCard';
import { WorkoutPreviewModal } from '@/components/workouts/WorkoutPreviewModal';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { useToast } from '@/hooks/use-toast';

// Content categories
const categories = [
  { id: 'all', name: 'All' },
  { id: 'programs', name: 'Programs' },
  { id: 'series', name: 'Series' },
  { id: 'workouts', name: 'Workouts' },
  { id: 'progress-tests', name: 'Progress Tests' },
  { id: 'form-library', name: 'Form Library' },
  { id: 'meal-ideas', name: 'Meal Ideas' },
  { id: 'knowledge', name: 'Knowledge' },
];

export default function Discover() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Handle opening the preview modal
  const handleWorkoutClick = (workout: any) => {
    setSelectedWorkout(workout);
    setIsPreviewModalOpen(true);
  };
  
  // Navigate to workout detail page
  const navigateToWorkoutDetail = (workoutId: number) => {
    window.location.href = `/workouts/${workoutId}`;
  };
  
  // Handle starting the workout
  const handleStartWorkout = () => {
    toast({
      title: "Workout started",
      description: `You've started ${selectedWorkout.title}`,
    });
    setIsPreviewModalOpen(false);
  };

  // Fetch workouts
  const workoutsQuery = useQuery<Workout[]>({
    queryKey: ['/api/workouts'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Fetch programs
  const programsQuery = useQuery<Program[]>({
    queryKey: ['/api/programs'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Loading state
  const isLoading = workoutsQuery.isLoading || programsQuery.isLoading;
  const hasError = workoutsQuery.error || programsQuery.error;

  // Filter content based on active category
  let displayContent: any[] = [];
  let programsContent: any[] = [];
  let workoutsContent: any[] = [];
  
  // Prepare programs content if available
  if (programsQuery.data) {
    programsContent = programsQuery.data.map(program => ({
      id: `program-${program.id}`,
      type: 'program',
      program: program, // Pass the whole program for ProgramCard
    }));
  }
  
  // Prepare workouts content if available
  if (workoutsQuery.data) {
    workoutsContent = workoutsQuery.data.map(workout => ({
      id: `workout-${workout.id}`,
      type: 'workout',
      title: workout.title,
      subtitle: workout.subtitle,
      description: workout.description,
      imageUrl: workout.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
      day: workout.day,
      totalDays: workout.totalDays,
      duration: workout.duration || 30, // Default value if duration not provided
    }));
  }
  
  // Fallback workouts data for when API fails or returns empty
  const fallbackWorkouts = [
    {
      id: 1,
      title: "High-Intensity Interval Training",
      subtitle: "Burn calories fast",
      description: "A workout that alternates between intense bursts of activity and fixed periods of less-intense activity or even complete rest.",
      imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop",
      duration: 25,
      totalDays: 1,
      day: 1
    },
    {
      id: 2,
      title: "Yoga Flow",
      subtitle: "Build flexibility and strength",
      description: "A sequence of yoga poses where you move from one to another seamlessly using your breath.",
      imageUrl: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=1000&auto=format&fit=crop",
      duration: 40,
      totalDays: 1,
      day: 1
    }
  ];
  
  // If workouts content is empty, use fallback data
  if (workoutsContent.length === 0) {
    workoutsContent = fallbackWorkouts.map(workout => ({
      id: `workout-${workout.id}`,
      type: 'workout',
      title: workout.title,
      subtitle: workout.subtitle,
      description: workout.description,
      imageUrl: workout.imageUrl,
      duration: workout.duration,
      totalDays: workout.totalDays,
      day: workout.day
    }));
  }
  
  // Fallback programs data for when API fails
  const fallbackPrograms = [
    {
      id: 1,
      title: "MAX Program",
      description: "Complete full-body transformation in 50 days",
      imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000&auto=format&fit=crop",
      difficulty: "intermediate",
      duration: 50,
      category: "strength",
      createdAt: new Date()
    },
    {
      id: 2,
      title: "Cardio Challenge",
      description: "Boost your cardiovascular fitness in just 30 days",
      imageUrl: "https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=1000&auto=format&fit=crop",
      difficulty: "beginner",
      duration: 30,
      category: "cardio",
      createdAt: new Date()
    }
  ];

  // Always use fallback data when programs is empty (could be due to API error or no data)
  if (programsContent.length === 0) {
    programsContent = fallbackPrograms.map(program => ({
      id: `program-${program.id}`,
      type: 'program',
      program: program
    }));
  }

  // Even if one of the queries fails, we can still show content from the other
  if (activeCategory === 'all') {
    // Combine all content types
    displayContent = [...programsContent, ...workoutsContent];
  } else if (activeCategory === 'programs') {
    // Show only programs
    displayContent = programsContent;
  } else if (activeCategory === 'workouts') {
    // Show only workouts
    displayContent = workoutsContent;
  } else {
    // Other categories would have their own logic here
    displayContent = [];
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search bar */}
      <div className="relative mb-6">
        <div className="flex items-center border border-gray-200 rounded-lg w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-12 py-3 w-full border-0 focus:ring-0 focus:outline-none rounded-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button className="p-1 focus:outline-none focus:ring-2 focus:ring-black rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="overflow-x-auto pb-2 mb-6">
        <div className="flex space-x-4 min-w-max">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 whitespace-nowrap ${
                activeCategory === category.id
                  ? 'text-black border-b-2 border-black font-medium'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Newest content section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-5">
          {activeCategory === 'all' ? 'Newest content' : 
           activeCategory === 'programs' ? 'Programs' : 
           activeCategory === 'workouts' ? 'Workouts' : 
           'Content'}
        </h2>
        
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
        
        {/* We don't show error anymore since we have fallbacks */}
        
        {!isLoading && displayContent.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No content available in this category.
          </div>
        )}
        
        {!isLoading && displayContent.length > 0 && (
          <div className="relative">
            {/* Carousel/Content cards */}
            <div className="flex overflow-x-auto pb-4 space-x-4 -mx-1 px-1 hide-scrollbar">
              {displayContent.map((item) => (
                item.type === 'program' ? (
                  <ProgramCard 
                    key={item.id}
                    program={item.program}
                  />
                ) : (
                  <WorkoutPreviewCard 
                    key={item.id}
                    workout={item}
                    onClick={() => handleWorkoutClick(item)}
                  />
                )
              ))}
              
              {displayContent.length > 3 && (
                <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-3 focus:outline-none">
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Workout Preview Modal */}
      <WorkoutPreviewModal 
        workout={selectedWorkout}
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        onStartWorkout={handleStartWorkout}
      />
    </div>
  );
}
