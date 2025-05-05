import StatisticsSection from "@/components/dashboard/StatisticsSection";
import FavouriteWorkoutsSection from "@/components/dashboard/FavouriteWorkoutsSection";

export default function Discover() {
  return (
    <div className="container mx-auto px-4 py-6">
      <StatisticsSection />
      <FavouriteWorkoutsSection />
    </div>
  );
}
