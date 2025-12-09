import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Loader2 } from 'lucide-react';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Sign up to start tracking your fitness journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Username</label>
            <input
              className="w-full px-3 py-2 border rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-slate-200">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-md border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-bold text-white transition-colors rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 flex justify-center items-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin" size={18} /> : <><UserPlus size={18} /> Register</>}
          </button>
        </form>
         <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="text-emerald-500 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
