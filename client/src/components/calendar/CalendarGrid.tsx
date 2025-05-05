import { useState } from "react";

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const CalendarGrid = ({ year, month, selectedDate, onSelectDate }: CalendarGridProps) => {
  // Generate calendar grid data
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const dayOfWeekAdjustment = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start
  
  // Create the grid with days
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Day names (Monday first)
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  
  // Check if a date is today
  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };
  
  // Check if a date is selected
  const isSelected = (day: number) => {
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };
  
  return (
    <div>
      {/* Day names row */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map((dayName) => (
          <div 
            key={dayName} 
            className="text-center text-sm text-gray-500 py-2"
          >
            {dayName}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of month */}
        {Array.from({ length: dayOfWeekAdjustment }, (_, i) => (
          <div key={`empty-${i}`} className="h-10 w-10"></div>
        ))}
        
        {/* Days of the month */}
        {days.map((day) => (
          <button
            key={day}
            onClick={() => onSelectDate(new Date(year, month, day))}
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
              ${isSelected(day) ? 'bg-black text-white' : ''}
              ${isToday(day) && !isSelected(day) ? 'border border-gray-300' : ''}
              ${!isSelected(day) ? 'hover:bg-gray-100' : ''}
            `}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;