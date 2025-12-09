import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { Activity, Clock, TrendingUp, Target, Edit2, Calendar, Trophy, Medal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ActivityHeatmap from './ActivityHeatmap';

const Dashboard = () => {
  const [exercises, setExercises] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalDuration: 0,
    totalExercises: 0,
    avgDuration: 0,
    currentWeekDuration: 0
  });
  const [personalBests, setPersonalBests] = useState([]);
  const { user, updateUser } = useAuth();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState(user?.weeklyGoal || 150);

  useEffect(() => {
    // Sync local state with user context if user loads late
    if (user?.weeklyGoal) {
      setNewGoal(user.weeklyGoal);
    }
  }, [user]);

  useEffect(() => {
    api.get('/exercises')
      .then(response => {
        setExercises(response.data);
        processData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const processData = (data) => {
    // 1. Calculate Summary Stats
    const totalDur = data.reduce((acc, curr) => acc + curr.duration, 0);
    const avgDur = data.length > 0 ? Math.round(totalDur / data.length) : 0;
    
    // Calculate Current Week Stats
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    const currentWeekDur = data.reduce((acc, curr) => {
      const exDate = parseISO(curr.date);
      if (isWithinInterval(exDate, { start: weekStart, end: weekEnd })) {
        return acc + curr.duration;
      }
      return acc;
    }, 0);

    setStats({
      totalDuration: totalDur,
      totalExercises: data.length,
      avgDuration: avgDur,
      currentWeekDuration: currentWeekDur
    });

    // 2. Prepare Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return {
        date: d,
        dateStr: format(d, 'MMM dd'),
        duration: 0
      };
    });

    // 3. Calculate Personal Bests
    const bests = {};
    data.forEach(ex => {
      const cat = ex.category || 'Other';
      if (!bests[cat] || ex.duration > bests[cat].duration) {
        bests[cat] = ex;
      }
    });
    setPersonalBests(Object.entries(bests).map(([cat, ex]) => ({ category: cat, ...ex })));

    data.forEach(exercise => {
      const exerciseDate = parseISO(exercise.date);
      const dayStat = last7Days.find(d => isSameDay(d.date, exerciseDate));
      if (dayStat) {
        dayStat.duration += exercise.duration;
      }
    });

    setChartData(last7Days);
  };

  const handleUpdateGoal = async () => {
    try {
      const res = await api.post('/users/update-goal', { weeklyGoal: newGoal });
      updateUser({ weeklyGoal: res.data.weeklyGoal });
      setIsEditingGoal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update goal');
    }
  };

  const weeklyGoal = user?.weeklyGoal || 150;
  const progressPercent = Math.min(100, Math.round((stats.currentWeekDuration / weeklyGoal) * 100));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Workout Time" 
          value={`${stats.totalDuration} min`} 
          icon={<Clock className="text-blue-500" size={24} />} 
          color="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatsCard 
          title="Total Exercises" 
          value={stats.totalExercises} 
          icon={<Activity className="text-emerald-500" size={24} />} 
          color="bg-emerald-50 dark:bg-emerald-900/20"
        />
        <StatsCard 
          title="Avg. Session Length" 
          value={`${stats.avgDuration} min`} 
          icon={<TrendingUp className="text-purple-500" size={24} />} 
          color="bg-purple-50 dark:bg-purple-900/20"
        />
        
        {/* Weekly Goal Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Target className="text-orange-500" size={20} />
            </div>
            {!isEditingGoal ? (
              <button onClick={() => setIsEditingGoal(true)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <Edit2 size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="w-16 px-1 py-0.5 text-sm border rounded dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
                <button onClick={handleUpdateGoal} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded hover:bg-emerald-600">Save</button>
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Weekly Goal</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.currentWeekDuration}</span>
              <span className="text-sm text-slate-500 mb-1">/ {weeklyGoal} min</span>
            </div>
          </div>

          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div 
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-right">{progressPercent}% achieved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200">Activity (Last 7 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="dateStr" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    color: '#1e293b'
                  }}
                />
                <Bar 
                  dataKey="duration" 
                  name="Minutes" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personal Bests Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Personal Bests
          </h3>
          <div className="space-y-4">
             {personalBests.length > 0 ? (
               personalBests.map((best, index) => (
                 <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-yellow-500">
                        <Medal size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{best.category}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{format(parseISO(best.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-500">{best.duration}m</span>
                 </div>
               ))
             ) : (
                <div className="text-center text-slate-500 py-8 text-sm">
                  Log your workouts to see your records here!
                </div>
             )}
          </div>
        </div>

        {/* Heatmap Section - Span Full Width */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Calendar className="text-emerald-500" size={20} />
            Yearly Consistency
          </h3>
          <ActivityHeatmap exercises={exercises} />
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default Dashboard;
