import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Target, Shield, Trophy, Medal, Award, Flame, Zap, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import api from '../utils/api';

const Profile = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/exercises')
      .then(res => {
        setExercises(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (!user) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  // --- Achievement Logic ---
  const achievements = [
    {
      id: 'rookie',
      title: 'Rookie',
      description: 'Logged your first workout!',
      icon: <Award className="text-orange-500" size={24} />,
      unlocked: exercises.length >= 1,
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/40' // Warm start
    },
    {
      id: 'dedication',
      title: 'Dedication',
      description: 'Logged 10 workouts.',
      icon: <Medal className="text-blue-500" size={24} />,
      unlocked: exercises.length >= 10,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/40'
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Reached 100 total minutes.',
      icon: <Shield className="text-purple-500" size={24} />,
      unlocked: exercises.reduce((acc, curr) => acc + curr.duration, 0) >= 100,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900/40'
    },
    {
      id: 'endurance',
      title: 'Endurance',
      description: 'Completed a 60+ min session.',
      icon: <Flame className="text-red-500" size={24} />,
      unlocked: exercises.some(ex => ex.duration >= 60),
      color: 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40'
    },
     {
      id: 'streak_master',
      title: 'Consistency', 
      description: 'Logged 5 workouts.',
      icon: <Zap className="text-yellow-500" size={24} />,
      unlocked: exercises.length >= 5,
      color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/40'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const handleExport = () => {
    if (exercises.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ["Description", "Category", "Duration (min)", "Date"];
    const csvRows = [headers.join(',')];

    exercises.forEach(ex => {
      const row = [
        `"${ex.description.replace(/"/g, '""')}"`, // Escape quotes
        ex.category || 'Other',
        ex.duration,
        ex.date.substring(0, 10)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `exercise_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-8">
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header / Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20">
             <Trophy size={100} className="text-white transform rotate-12" />
           </div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="p-1.5 bg-white dark:bg-slate-900 rounded-full">
               <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                 <User size={48} />
               </div>
            </div>
            
             <div className="mb-2">
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                 <Trophy size={14} />
                 {unlockedCount} / {achievements.length} Achievements
               </span>
             </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.username}</h1>
            <p className="text-slate-500 dark:text-slate-400">Fitness Enthusiast</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Member Details Card */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Member Since</p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">
                      {user.createdAt ? format(parseISO(user.createdAt), 'MMMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Account Type</p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">Free Plan</p>
                  </div>
                </div>

                <button 
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  Download My Data (CSV)
                </button>
              </div>
            </div>

            {/* Goals Card */}
             <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Fitness Goals</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                    <Target size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Weekly Target</p>
                    <p className="font-medium text-slate-900 dark:text-slate-200">
                      {user.weeklyGoal || 150} Minutes / Week
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Trophies Section */}
      <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
          <Trophy className="text-yellow-500" />
          Trophy Case
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id}
              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                achievement.unlocked 
                  ? `${achievement.color} shadow-sm` 
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 grayscale'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-white/80 dark:bg-black/20' : 'bg-slate-200 dark:bg-slate-800'}`}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className={`font-bold ${achievement.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {achievement.description}
                  </p>
                </div>
              </div>
              {!achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <Shield size={12} className="text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
