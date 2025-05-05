import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  month: string;
  year: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader = ({ month, year, onPrevMonth, onNextMonth }: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <button 
        onClick={onPrevMonth}
        className="p-2 rounded-full hover:bg-gray-100"
        aria-label="Previous month"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      
      <h2 className="text-xl font-medium">
        {month}, {year}
      </h2>
      
      <button 
        onClick={onNextMonth}
        className="p-2 rounded-full hover:bg-gray-100"
        aria-label="Next month"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default CalendarHeader;