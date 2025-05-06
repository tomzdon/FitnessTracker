import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

type ProgramCardProps = {
  program: {
    id: number;
    title: string;
    description?: string;
    imageUrl?: string;
    duration: number;
    difficulty: string;
    category?: string;
  };
};

export function ProgramCard({ program }: ProgramCardProps) {
  const [_, navigate] = useLocation();

  const handleClick = () => {
    navigate(`/programs/${program.id}`);
  };

  return (
    <motion.div
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      }}
      className="flex-shrink-0 w-[280px] md:w-[320px] rounded-lg overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div 
        className="aspect-[3/4] relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${program.imageUrl || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Top badge */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="bg-white text-black text-xs font-bold px-2 py-1 rounded-full">
            PROGRAM
          </div>
        </div>
        
        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold mb-1">{program.title}</h3>
          <p className="text-xs text-gray-200 uppercase tracking-wider mb-2">
            {program.difficulty} • {program.category || 'General'}
          </p>
          
          <div className="flex items-center mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{program.duration} DAYS</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}