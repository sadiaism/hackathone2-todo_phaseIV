'use client';

import React, { useContext } from 'react';
import { useAuth } from '../lib/auth/auth-context';
import { TaskProvider, TaskContext } from '../lib/api/task-context';
import Header from '../../components/ui/Header';
import TaskForm from '../../components/tasks/TaskForm';
import TaskList from '../../components/tasks/TaskList';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {state.currentUser?.email}!</h1>
                <p className="text-gray-600 mt-1">Manage your tasks efficiently</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <p className="text-sm text-gray-500">
                  {state.currentUser?.username}&apos;s dashboard
                </p>
              </div>
            </div>
          </div>

          <TaskProvider>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TaskForm />
              </div>
              <div className="lg:col-span-1">
                <TaskStats />
              </div>
            </div>

            <div className="mt-6">
              <TaskList />
            </div>
          </TaskProvider>
        </div>
      </main>
    </div>
  );
};

// Inline component to avoid hook context issues
const TaskStats: React.FC = () => {
  const context = useContext(TaskContext);

  if (!context) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Quick Stats</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Loading...</span>
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
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Quick Stats</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Tasks:</span>
          <span className="font-medium">{totalTasks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Completed:</span>
          <span className="font-medium text-green-600">{completedTasks}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Pending:</span>
          <span className="font-medium text-yellow-600">{pendingTasks}</span>
        </div>
      </div>
    </div>
  );
}
export default DashboardPage;