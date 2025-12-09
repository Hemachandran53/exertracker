import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Pencil, Trash2, Activity, Filter, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { subDays, isAfter, parseISO, startOfDay } from 'date-fns';

const Exercise = (props) => (
  <tr className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
    <td className="px-6 py-4 text-slate-800 dark:text-slate-300">
      <div>{props.exercise.description}</div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mt-1 inline-block">
        {props.exercise.category || 'Other'}
      </span>
    </td>
    <td className="px-6 py-4 text-slate-800 dark:text-slate-300">{props.exercise.duration} min</td>
    <td className="px-6 py-4 text-slate-800 dark:text-slate-300">{props.exercise.date.substring(0, 10)}</td>
    <td className="px-6 py-4 text-right space-x-2">
      <Link to={"/edit/" + props.exercise._id} className="inline-block text-slate-400 hover:text-emerald-500 transition-colors">
        <Pencil size={18} />
      </Link>
      <button onClick={() => props.deleteExercise(props.exercise._id)} className="text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 size={18} />
      </button>
    </td>
  </tr>
);

const ExercisesList = () => {
  const [exercises, setExercises] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('All Time');
  const [sortBy, setSortBy] = useState('DateNewest');

  useEffect(() => {
    api.get('/exercises')
      .then(res => setExercises(res.data))
      .catch(err => console.log(err));
  }, []);

  const deleteExercise = (id) => {
    api.delete('/exercises/' + id)
      .then(res => console.log(res.data));
    setExercises(exercises.filter(el => el._id !== id));
  };

  // Filtering and Sorting Logic
  const getFilteredExercises = () => {
    let result = [...exercises];

    // 1. Filter by Category
    if (filterCategory !== 'All') {
      result = result.filter(ex => (ex.category || 'Other') === filterCategory);
    }

    // 2. Filter by Date
    const today = new Date();
    if (filterDate === 'Last 7 Days') {
      const cutOff = subDays(today, 7);
      result = result.filter(ex => isAfter(parseISO(ex.date), cutOff));
    } else if (filterDate === 'Last 30 Days') {
      const cutOff = subDays(today, 30);
      result = result.filter(ex => isAfter(parseISO(ex.date), cutOff));
    }

    // 3. Sort
    result.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      switch (sortBy) {
        case 'DateNewest': return dateB - dateA;
        case 'DateOldest': return dateA - dateB;
        case 'DurationHigh': return b.duration - a.duration;
        case 'DurationLow': return a.duration - b.duration;
        default: return dateB - dateA;
      }
    });

    return result;
  };

  const filteredExercises = getFilteredExercises();

  const exerciseList = () => {
    return filteredExercises.map(currentexercise => (
      <Exercise exercise={currentexercise} deleteExercise={deleteExercise} key={currentexercise._id} />
    ));
  };

  // Prepare chart data - Use filtered data for more specific insights? 
  // Or keep it global? Let's use global for the top stats to show overall activity, 
  // but maybe filtered for the chart? Standard practice usually keeps charts global unless specified.
  // Actually, filtering the chart allows deep dive (e.g. only Cardio progress). Let's use filteredExercises.
  const chartData = filteredExercises.reduce((acc, curr) => {
    const date = curr.date.substring(0, 10);
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.duration += curr.duration;
    } else {
      acc.push({ date, duration: curr.duration });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)); 
  // Note: Removing slice(-7) to allow seeing full filtered history if desired, or maybe keep it for "Recent"?
  // Let's keep it restricted to reasonable size for visual clarity, maybe 14 days if filtered?
  // User asked for filters, seeing "Last 30 Days" chart is valuable. Let's show all qualifying data but maybe scrollable if too large?
  // Recharts handles it okay, but let's slice if it's "All Time" to avoid overcrowding, say last 14 entries.
  const displayChartData = filterDate === 'All Time' ? chartData.slice(-14) : chartData;


  const categories = ['All', 'Cardio', 'Strength', 'Flexibility', 'Balance', 'Other'];

  return (
    <div className="space-y-8">
      {/* Stats Section - using Filtered Data to show stats for current view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg col-span-1 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="text-emerald-500" />
             Activity ({filterDate})
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {displayChartData.length > 0 ? (
                <BarChart data={displayChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickFormatter={(value) => value.slice(5)} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#10b981' }}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                  />
                  <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No data for selected filters
                </div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-gradient-to-br from-emerald-100 to-white dark:from-emerald-900/40 dark:to-slate-900 p-6 rounded-lg border border-emerald-200 dark:border-emerald-900/50 shadow-lg">
             <h4 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase">Workouts</h4>
             <p className="text-4xl font-bold text-emerald-900 dark:text-white mt-2">{filteredExercises.length}</p>
             <p className="text-xs text-slate-500 mt-1">in current view</p>
           </div>
           <div className="bg-gradient-to-br from-blue-100 to-white dark:from-blue-900/40 dark:to-slate-900 p-6 rounded-lg border border-blue-200 dark:border-blue-900/50 shadow-lg">
             <h4 className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase">Time</h4>
             <p className="text-4xl font-bold text-blue-900 dark:text-white mt-2">
               {filteredExercises.reduce((acc, curr) => acc + curr.duration, 0)}
             </p>
             <p className="text-xs text-slate-500 mt-1">minutes in current view</p>
           </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Exercise History</h3>
           
           {/* Filters Toolbar */}
           <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
               <Filter size={16} className="text-slate-400" />
               <select 
                 className="bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
                 value={filterCategory}
                 onChange={(e) => setFilterCategory(e.target.value)}
               >
                 {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
             </div>

             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
               <select 
                 className="bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
                 value={filterDate}
                 onChange={(e) => setFilterDate(e.target.value)}
               >
                 <option value="All Time">All Time</option>
                 <option value="Last 7 Days">Last 7 Days</option>
                 <option value="Last 30 Days">Last 30 Days</option>
               </select>
             </div>

             <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
               <ArrowUpDown size={16} className="text-slate-400" />
               <select 
                 className="bg-transparent text-sm text-slate-600 dark:text-slate-300 focus:outline-none"
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
               >
                 <option value="DateNewest">Date (Newest)</option>
                 <option value="DateOldest">Date (Oldest)</option>
                 <option value="DurationHigh">Duration (High-Low)</option>
                 <option value="DurationLow">Duration (Low-High)</option>
               </select>
             </div>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-950/50">
              <tr>
                <th scope="col" className="px-6 py-3">Description / Category</th>
                <th scope="col" className="px-6 py-3">Duration</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exerciseList()}
            </tbody>
          </table>
          {filteredExercises.length === 0 && (
            <div className="p-6 text-center text-slate-500">
              No exercises found matching your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisesList;
