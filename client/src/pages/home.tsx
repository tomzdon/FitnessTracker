import StatisticsSection from "@/components/dashboard/StatisticsSection";
import FavouriteWorkoutsSection from "@/components/dashboard/FavouriteWorkoutsSection";
import { ActiveProgramCard } from "@/components/programs/ActiveProgramCard";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <StatisticsSection />
        </div>
        <div>
          <ActiveProgramCard />
        </div>
      </div>
      
      <FavouriteWorkoutsSection />
    </div>
  );
}
