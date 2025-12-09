import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, PlusCircle, List, LogOut, Moon, Sun, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="text-emerald-500" size={28} />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              ExerTracker
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-emerald-500 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
               <>
                 <div className="hidden md:flex items-center space-x-4">
                  <Link 
                     to="/dashboard" 
                     className={`flex items-center space-x-1 transition-colors ${location.pathname === '/dashboard' ? 'text-emerald-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'}`}
                   >
                     <LayoutDashboard size={18} />
                     <span>Dashboard</span>
                   </Link>
                   <Link 
                     to="/" 
                     className={`flex items-center space-x-1 transition-colors ${location.pathname === '/' ? 'text-emerald-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'}`}
                   >
                     <List size={18} />
                     <span>Exercises</span>
                   </Link>
                   <Link 
                     to="/create" 
                     className={`flex items-center space-x-1 transition-colors ${location.pathname === '/create' ? 'text-emerald-500 font-medium' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'}`}
                   >
                     <PlusCircle size={18} />
                     <span>Log Exercise</span>
                   </Link>
                 </div>
                 
                 <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

                 <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">
                   Hi, {user.username}
                 </span>
                 <Link to="/profile" className="flex items-center space-x-1 text-slate-400 hover:text-emerald-500 transition-colors" aria-label="Profile">
                   <User size={20} />
                 </Link>
                 <button onClick={logout} className="flex items-center space-x-1 text-slate-400 hover:text-red-500 transition-colors" aria-label="Logout">
                   <LogOut size={20} />
                 </button>
               </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-emerald-500 font-medium transition-colors">Login</Link>
                <Link to="/register" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
