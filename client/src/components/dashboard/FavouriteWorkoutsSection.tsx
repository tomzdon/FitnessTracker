import { useQuery } from "@tanstack/react-query";

const FavouriteWorkoutsSection = () => {
  const { data: favourites = [] } = useQuery({
    queryKey: ['/api/favourites'],
  });

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Favourite workouts</h2>
      </div>
      
      {/* Empty State */}
      {favourites.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-1">Add favourites</h3>
          <p className="text-gray-500 text-sm">Bookmark the content you love</p>
        </div>
      )}

      {/* Favorites List - Would render when favourites exist */}
      {favourites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favourites.map((favourite) => (
            <div key={favourite.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Favourite workout card content would go here */}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FavouriteWorkoutsSection;
