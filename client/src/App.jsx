import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExercisesList from './components/ExercisesList';
import EditExercise from './components/EditExercise';
import CreateExercise from './components/CreateExercise';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import RequireAuth from './components/RequireAuth';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500/30 transition-colors duration-300">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/profile" element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              } />

              <Route path="/dashboard" element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              } />

              <Route path="/" element={
                <RequireAuth>
                  <ExercisesList />
                </RequireAuth>
              } />
              <Route path="/edit/:id" element={
                <RequireAuth>
                  <EditExercise />
                </RequireAuth>
              } />
              <Route path="/create" element={
                <RequireAuth>
                  <CreateExercise />
                </RequireAuth>
              } />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
