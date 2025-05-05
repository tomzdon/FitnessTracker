import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import CalendarHeader from '@/components/calendar/CalendarHeader';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import DayPanel from '@/components/calendar/DayPanel';
import { useQuery } from '@tanstack/react-query';

export default function Calendar() {
  // State for the current month and selected date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get month and year for display
  const monthYear = format(currentDate, 'MMMM');
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Handle month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Query for workouts on the selected date
  const { data: dayWorkouts = [] } = useQuery({
    queryKey: ['/api/workouts', selectedDate.toISOString().split('T')[0]],
    // Function to fetch workouts for the selected date
    queryFn: async ({ queryKey }) => {
      const [_path, date] = queryKey;
      const response = await fetch(`/api/workouts?date=${date}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      return response.json();
    }
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-center mb-8">Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Calendar section - 5 columns on large screens */}
        <div className="lg:col-span-5 bg-white rounded-lg p-6 shadow-sm">
          <CalendarHeader 
            month={monthYear} 
            year={year} 
            onPrevMonth={goToPreviousMonth} 
            onNextMonth={goToNextMonth} 
          />
          
          <CalendarGrid 
            year={year} 
            month={month} 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </div>
        
        {/* Day panel - 2 columns on large screens */}
        <div className="lg:col-span-2">
          <DayPanel 
            selectedDate={selectedDate} 
            workouts={dayWorkouts} 
          />
        </div>
      </div>
    </div>
  );
}
