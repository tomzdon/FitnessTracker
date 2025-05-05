import { Plus } from "lucide-react";

import { Workout } from "@shared/schema";

interface DayPanelProps {
  selectedDate: Date;
  workouts: Workout[] | unknown; // Using the proper Workout type
}

const DayPanel = ({ selectedDate, workouts = [] }: DayPanelProps) => {
  const isToday = () => {
    const today = new Date();
    return (
      today.getDate() === selectedDate.getDate() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium mb-4">
        {isToday() ? "Today" : new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(selectedDate)}
      </h3>

      {workouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="mb-4 p-3 rounded-full bg-gray-100">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium mb-2">No workouts for this day</h4>
          <p className="text-gray-500 text-sm mb-8">
            Assign another workout or just enjoy the rest of your day.
          </p>
          <button className="bg-gray-900 text-white py-3 px-5 rounded-md hover:bg-gray-800 font-medium">
            Assign new workout
          </button>
        </div>
      ) : (
        <div>
          {/* Workouts would be listed here */}
          {workouts.map((workout) => (
            <div key={workout.id} className="border-b border-gray-200 py-3">
              <h4 className="font-medium">{workout.title}</h4>
              <p className="text-sm text-gray-500">{workout.duration} minutes</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DayPanel;