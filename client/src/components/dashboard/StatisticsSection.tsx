import StatCard from "./StatCard";
import { useQuery } from "@tanstack/react-query";

const StatisticsSection = () => {
  const { data: statistics = { workouts: 0, streak: 0, progressTests: 0 } } = useQuery({
    queryKey: ['/api/statistics'],
  });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Statistics</h2>
        <a href="#" className="text-sm text-gray-500 hover:text-gray-700">See all</a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          value={statistics.workouts} 
          title="WORKOUTS" 
          subtitle="COMPLETED" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 3a1 1 0 011-1h.01a1 1 0 010 2H7a1 1 0 01-1-1zm2 3a1 1 0 00-2 0v1a2 2 0 00-2 2v1a2 2 0 00-2 2v.683a3.7 3.7 0 011.055.485 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0 3.704 3.704 0 014.11 0 1.704 1.704 0 001.89 0A3.7 3.7 0 0118 12.683V12a2 2 0 00-2-2V9a2 2 0 00-2-2V6a1 1 0 10-2 0v1h-1V6a1 1 0 10-2 0v1H8V6zm10 8.868a3.704 3.704 0 01-4.055-.036 1.704 1.704 0 00-1.89 0 3.704 3.704 0 01-4.11 0 1.704 1.704 0 00-1.89 0A3.704 3.704 0 012 14.868V17a1 1 0 001 1h14a1 1 0 001-1v-2.132zM9 3a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          } 
          bgColor="bg-blue-100" 
        />
        
        <StatCard 
          value={statistics.streak} 
          title="WEEK STREAK" 
          subtitle="MIN. 3 WORKOUT DAYS PER WEEK" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          } 
          bgColor="bg-purple-100" 
        />
        
        <StatCard 
          value={statistics.progressTests} 
          title="PROGRESS TESTS" 
          subtitle="COMPLETED" 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.795.077 1.584.24 2.346.483a.75.75 0 01.554.72V7.25a.75.75 0 01-.832.74c-1.36-.193-2.854-.293-4.403-.293-1.19 0-2.33.056-3.397.156a.75.75 0 01-.668-.943A52.309 52.309 0 016 6.75v-3zm8.25-.75a1.25 1.25 0 00-1.25 1.25v2.996c.92-.102 1.777-.23 2.569-.386V3.75A1.25 1.25 0 0014.25 2.5h-2.5zM8.5 12.75a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zm2 0a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5zm2 0a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" clipRule="evenodd" />
            </svg>
          } 
          bgColor="bg-amber-100" 
        />
      </div>
    </section>
  );
};

export default StatisticsSection;
