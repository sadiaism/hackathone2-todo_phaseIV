'use client';

import React, { useContext } from 'react';
import { useAuth } from '../lib/auth/auth-context';
import { TaskProvider, TaskContext } from '../lib/api/task-context';
import Header from '@/components/ui/Header';
import TaskForm from '@/components/tasks/TaskForm';
import TaskList from '@/components/tasks/TaskList';
import Footer from '@/components/ui/Footer';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Inline component to avoid hook context issues
const TaskStats: React.FC = () => {
  const context = useContext(TaskContext);

  if (!context) {
    return (
      <div className="bg-white/40 backdrop-blur-xl bg-opacity-40 rounded-2xl shadow-xl border border-white/30 p-5 animate-fade-in">
        <h2 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Quick Stats
        </h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
            <span className="text-indigo-600/70">Loading...</span>
            <span className="font-medium">-</span>
          </div>
        </div>
      </div>
    );
  }

  const { state } = context;
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="bg-white/40 backdrop-blur-xl bg-opacity-40 rounded-2xl shadow-xl border border-white/30 p-5 animate-fade-in">
      <h2 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Quick Stats
      </h2>
      <div className="space-y-2">
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-100/40 to-purple-100/40 rounded-lg">
          <span className="text-indigo-700 font-medium">Total Tasks</span>
          <span className="text-lg font-bold text-indigo-700">{totalTasks}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-100/40 to-teal-100/40 rounded-lg">
          <span className="text-indigo-700 font-medium">Completed</span>
          <span className="text-lg font-bold text-emerald-700">{completedTasks}</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-100/40 to-orange-100/40 rounded-lg">
          <span className="text-indigo-700 font-medium">Pending</span>
          <span className="text-lg font-bold text-amber-700">{pendingTasks}</span>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.push('/auth/login');
    }
  }, [state, router]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100/50 via-indigo-100/40 to-purple-100/30">
        <Header />
        <main className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/50 via-indigo-100/40 to-purple-100/30">
      <Header />
      <main className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 animate-fade-in">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent mb-1">Welcome back,</h1>
            <p className="text-sm text-blue-700/80">Manage your tasks efficiently and boost your productivity</p>
          </div>

          <TaskProvider>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <div className="bg-white/60 backdrop-blur-xl bg-opacity-60 rounded-2xl shadow-xl border-2 border-blue-900/40 p-5 card-hover transition-all duration-300 hover:bg-white/70 hover:shadow-2xl hover:border-blue-800/50">
                    <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Add New Task
                    </h2>
                    <TaskForm />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-white/60 backdrop-blur-xl bg-opacity-60 rounded-2xl shadow-xl border-2 border-blue-900/40 p-5 card-hover h-full transition-all duration-300 hover:bg-white/70 hover:shadow-2xl hover:border-blue-800/50">
                    <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Quick Stats
                    </h2>
                    <TaskStats />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-xl bg-opacity-60 rounded-2xl shadow-xl border-2 border-blue-900/40 p-5 card-hover transition-all duration-300 hover:bg-white/70 hover:shadow-2xl hover:border-blue-800/50">
                <h2 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Your Tasks
                </h2>
                <TaskList />
              </div>
            </div>
          </TaskProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardPage;