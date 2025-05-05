import { Dumbbell } from "lucide-react";

const EmptyWorkoutHistory = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-40 h-40 mx-auto">
            {/* Placeholder illustration */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 200 200" 
              className="w-full h-full text-gray-200" 
              fill="currentColor"
            >
              <path d="M100,20 L120,40 L120,80 L80,80 L80,40 Z" />
              <circle cx="100" cy="140" r="40" fillOpacity="0.5" />
              <rect x="70" y="100" width="60" height="15" rx="5" fillOpacity="0.7" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">You have not completed any workouts yet</h3>
        <p className="text-gray-500 mb-8">
          Complete your first workout to start tracking your progress
        </p>
        
        <a 
          href="/discover"
          className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800"
        >
          <Dumbbell className="w-5 h-5 mr-2" />
          Explore workouts
        </a>
      </div>
    </div>
  );
};

export default EmptyWorkoutHistory;