import { useState } from 'react';
import { motion } from 'framer-motion';
import { Workout } from '@shared/schema';
import { FavoriteButton } from '@/components/workouts/FavoriteButton';
import { useQuery } from '@tanstack/react-query';

interface WorkoutPreviewCardProps {
  workout: {
    id: string | number;
    type: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    duration?: number;
    day?: number;
    totalDays?: number;
  };
  onClick?: () => void;
}

export function WorkoutPreviewCard({ workout, onClick }: WorkoutPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Check if this workout is already a favorite
  const { data: favorites = [] } = useQuery<any[]>({
    queryKey: ['/api/favourites'],
  });
  
  // Extract the numeric ID from the workout.id (which could be a string like "workout-5")
  const workoutId = typeof workout.id === 'string' && workout.id.includes('-') 
    ? parseInt(workout.id.split('-')[1]) 
    : Number(workout.id);
  
  // Check if this workout is in favorites
  const isFavorite = favorites.some(favorite => favorite.id === workoutId);
  
  // Custom click handler to prevent FavoriteButton click from triggering workout preview
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick();
  };
  
  // Handle favorite button click without triggering parent
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <motion.div 
      className="flex-shrink-0 w-[280px] md:w-[320px] rounded-lg overflow-hidden relative cursor-pointer"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div 
        className="aspect-[3/4] relative group"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${workout.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Animated glow effect */}
        {isHovered && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      
        {/* Top badge */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <motion.div 
            className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full"
            whileHover={{ backgroundColor: '#f3f4f6' }}
          >
            {workout.type === 'program' ? 'PROGRAM' : 
             workout.day && workout.totalDays ? `DAY ${workout.day}/${workout.totalDays}` : 
             'WORKOUT'}
          </motion.div>
          
          <div onClick={handleFavoriteClick}>
            <FavoriteButton
              workoutId={workoutId}
              isFavorite={isFavorite}
              size="sm"
              variant="ghost"
            />
          </div>
        </div>
        
        {/* Bottom content */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 text-white"
          initial={{ y: 0 }}
          animate={{ y: isHovered ? -5 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <h3 className="text-xl font-bold mb-1">{workout.title}</h3>
          {workout.subtitle && (
            <p className="text-xs text-gray-200 uppercase tracking-wider mb-2">
              {workout.subtitle}
            </p>
          )}
          
          {workout.duration && (
            <motion.div 
              className="flex items-center mt-2"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0.8 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{workout.duration} MIN</span>
            </motion.div>
          )}
          
          {/* Play button that appears on hover */}
          {isHovered && (
            <motion.button
              className="mt-3 flex items-center bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ backgroundColor: '#2563eb' }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Preview
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}