import FavouriteWorkoutsSection from "@/components/dashboard/FavouriteWorkoutsSection";

export default function Favorites() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Your Favourites</h1>
      <FavouriteWorkoutsSection />
    </div>
  );
}
