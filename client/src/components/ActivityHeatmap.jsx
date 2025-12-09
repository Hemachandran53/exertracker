import React from 'react';
import { format, eachDayOfInterval, subDays, getDay } from 'date-fns';

const ActivityHeatmap = ({ exercises }) => {
  // 1. Generate last 365 days
  const today = new Date();
  const startDate = subDays(today, 364); // Approx 1 year
  
  const days = eachDayOfInterval({
    start: startDate,
    end: today
  });

  // 2. Process data map
  const dataMap = {};
  exercises.forEach(ex => {
    const dateStr = ex.date.substring(0, 10);
    dataMap[dateStr] = (dataMap[dateStr] || 0) + ex.duration;
  });

  // 3. Helper for intensity class
  const getIntensityClass = (duration) => {
    if (!duration) return 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50'; // Added borders for better visibility of empty cells
    if (duration < 30) return 'bg-emerald-200 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800';
    if (duration < 60) return 'bg-emerald-400 dark:bg-emerald-600 border border-emerald-500 dark:border-emerald-500';
    if (duration < 90) return 'bg-emerald-500 dark:bg-emerald-500 border border-emerald-600 dark:border-emerald-400';
    return 'bg-emerald-700 dark:bg-emerald-400 border border-emerald-800 dark:border-emerald-300';
  };

  // Group by weeks for the GitHub-style horizontal layout (weeks as columns)
  const weeks = [];
  let currentWeek = [];
  
  // Pad the beginning if start date is not Sunday (0)
  const startDay = getDay(startDate); // 0 = Sunday
  for (let i = 0; i < startDay; i++) {
    currentWeek.push(null); 
  }

  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  // Push remaining days
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
        <div className="min-w-max flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                if (!day) return <div key={`placeholder-${dayIndex}`} className="w-3 h-3" />;
                
                const dateStr = format(day, 'yyyy-MM-dd');
                const duration = dataMap[dateStr] || 0;
                
                return (
                  <div
                    key={dateStr}
                    className={`w-3 h-3 rounded-sm ${getIntensityClass(duration)} cursor-help transition-all duration-200 hover:scale-125 hover:z-10`}
                    title={`${format(day, 'MMM dd, yyyy')}: ${duration} min`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"></div>
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/60"></div>
        <div className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-600"></div>
        <div className="w-3 h-3 rounded-sm bg-emerald-500 dark:bg-emerald-500"></div>
        <div className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-400"></div>
        <span>More</span>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
