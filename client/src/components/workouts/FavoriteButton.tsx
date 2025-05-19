import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface FavoriteButtonProps {
  workoutId: number;
  isFavorite: boolean;
  size?: 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
}

export function FavoriteButton({ 
  workoutId, 
  isFavorite: initialIsFavorite, 
  size = 'default',
  variant = 'ghost'
}: FavoriteButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  // Update local state when prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  // Add to favorites mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/favourites', { workoutId });
      return await res.json();
    },
    onSuccess: () => {
      setIsFavorite(true);
      toast({
        title: 'Added to favorites',
        description: 'Workout has been added to your favorites',
      });
      // Force refetch the favorites list
      queryClient.invalidateQueries({ queryKey: ['/api/favourites'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add to favorites',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      console.log(`Usuwanie ulubionego treningu, ID: ${workoutId}`);
      
      try {
        // Najpierw sprawdźmy, co zwraca endpoint /api/favourites/details
        const detailsRes = await fetch('/api/favourites/details');
        const favoritesDetails = await detailsRes.json();
        console.log('Szczegóły ulubionych:', favoritesDetails);
        
        // Remove directly by workoutId
        const res = await apiRequest('DELETE', `/api/favourites/by-workout/${workoutId}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error('Błąd podczas usuwania ulubionego:', errorData);
          throw new Error(errorData.message || 'Nie udało się usunąć ulubionego treningu');
        }
        
        return { workoutId };
      } catch (error) {
        console.error('Wystąpił błąd:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Pomyślnie usunięto ulubiony trening:', data);
      setIsFavorite(false);
      toast({
        title: 'Removed from favorites',
        description: 'Workout has been removed from your favorites',
      });
      // Force refetch the favorites list
      queryClient.invalidateQueries({ queryKey: ['/api/favourites'] });
    },
    onError: (error: Error) => {
      console.error('Błąd usuwania ulubionego:', error);
      toast({
        title: 'Failed to remove from favorites',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const isLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

  const handleToggleFavorite = () => {
    if (isLoading) return;
    
    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  return (
    <Button 
      variant={variant} 
      size={size}
      onClick={handleToggleFavorite}
      disabled={isLoading}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={isFavorite ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}
    >
      <Heart className={`h-[1.2em] w-[1.2em] ${isFavorite ? 'fill-current' : ''}`} />
    </Button>
  );
}