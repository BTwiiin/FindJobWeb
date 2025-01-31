import React, { useState } from 'react';

interface Task {
  id: string;
  date: string;
  task: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateCalendarGrid = () => {
    const totalDays = startDay + daysInMonth;
    const weeks = Math.ceil(totalDays / 7);
    const calendar = [];
    for (let i = 0; i < weeks; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const day = i * 7 + j - startDay + 1;
        week.push(day > 0 && day <= daysInMonth ? day : null);
      }
      calendar.push(week);
    }
    return calendar;
  };

  const calendarGrid = generateCalendarGrid();

  // Mock tasks for random dates
  const mockTasks: Task[] = [
    { id: '1', date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-05`, task: 'Team Meeting' },
    { id: '2', date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-12`, task: 'Project Deadline' },
    { id: '3', date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-19`, task: 'Client Call' },
    { id: '4', date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-25`, task: 'Presentation' },
  ];

  // Mock function to get tasks for a specific date
  const getTasksForDate = (date: string) => {
    return mockTasks.filter((task) => task.date === date);
  };

  return (
    // Instead of "h-screen", just let the parent decide the height:
    <div className="flex flex-col bg-white w-full">
      {/* Header */}
      <header className="bg-white text-black p-4 flex justify-between items-center">
        <button onClick={handlePrevMonth} className="text-black hover:text-gray-400">
          &larr; Previous
        </button>
        <h1 className="text-lg font-bold">
          {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
        </h1>
        <button onClick={handleNextMonth} className="text-black hover:text-gray-400">
          Next &rarr;
        </button>
      </header>

      {/* Main Calendar Content */}
      <div className="p-4">
        {/* Weekday Header */}
        <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-700 mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 bg-gray-200 rounded">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarGrid.flat().map((day, index) => {
            const formattedDate = day
              ? `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
                  .toString()
                  .padStart(2, '0')}-${String(day).padStart(2, '0')}`
              : null;
            const dayTasks = formattedDate ? getTasksForDate(formattedDate) : [];

            return (
              <div
                key={index}
                className={`p-2 border border-gray-300 rounded-lg relative ${
                  day ? 'bg-white' : 'bg-gray-100'
                }`}
                style={{ minHeight: '80px' }} // smaller min-height if you want less vertical space
              >
                {/* Day Number */}
                <div className="absolute top-1 left-1 text-xs font-bold">{day || ''}</div>
                {/* Tasks */}
                <div className="mt-5 flex flex-col space-y-1">
                  {dayTasks.map((task) => (
                    <div key={task.id} className="bg-blue-100 text-blue-900 rounded p-1 text-sm">
                      {task.task}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;