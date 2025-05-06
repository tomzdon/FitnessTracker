import { FavoriteWorkouts } from "@/components/favorites/FavoriteWorkouts";
import { useAuth } from "@/hooks/use-auth";

export default function FavoritesPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <p className="text-muted-foreground">
          View and manage your favorite workouts
        </p>
      </div>

      <FavoriteWorkouts />
    </div>
  );
}