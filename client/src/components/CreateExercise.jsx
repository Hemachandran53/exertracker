import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';

const CreateExercise = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    description: '',
    duration: 0,
    date: new Date().toISOString().split('T')[0],
    category: 'Other'
  });
  const [loading, setLoading] = useState(false);

  const categories = ['Cardio', 'Strength', 'Flexibility', 'Balance', 'Other'];

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/exercises/add', form);
      navigate('/');
    } catch (err) {
      console.log(err);
      alert('Error adding exercise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xl">
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
        <Save className="text-emerald-500" />
        Log New Exercise
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">Description</label>
          <input
            required
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded py-2 px-3 focus:border-emerald-500 focus:outline-none"
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="e.g. Morning Run, Bench Press"
          />
        </div>
        
        <div>
           <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">Category</label>
           <select
             required
             className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded py-2 px-3 focus:border-emerald-500 focus:outline-none"
             name="category"
             value={form.category}
             onChange={onChange}
           >
             {categories.map(cat => (
               <option key={cat} value={cat}>{cat}</option>
             ))}
           </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">Duration (min)</label>
            <input
              required
              type="number"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded py-2 px-3 focus:border-emerald-500 focus:outline-none"
              name="duration"
              value={form.duration}
              onChange={onChange}
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">Date</label>
             <input
              required
              type="date"
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded py-2 px-3 focus:border-emerald-500 focus:outline-none"
              name="date"
              value={form.date}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin" /> : 'Add Exercise Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExercise;
