'use client';

import React from 'react';
import { useTasks } from '../../app/lib/api/task-context';
import TaskItem from "./TaskItem";


const TaskList: React.FC = () => {
  const { state, setFilter } = useTasks();

  // Filter tasks based on the current filter
  const filteredTasks = state.tasks.filter(task => {
    if (state.filter === 'active') return !task.completed;
    if (state.filter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <div className="w-full">
      {state.loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : state.error ? (
        <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-400 p-4 rounded-xl mb-4 animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{state.error}</p>
            </div>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="mx-auto flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No tasks found</h3>
          <p className="text-gray-600">
            {state.filter === 'completed'
              ? 'No completed tasks yet. Keep up the good work!'
              : state.filter === 'active'
                ? 'No active tasks. Great job staying on top of everything!'
                : 'No tasks yet. Add one to get started!'}
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {filteredTasks.map((task, index) => (
            <div key={task.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <TaskItem task={task} />
            </div>
          ))}
        </div>
      )}

      {/* Filter controls */}
      <div className="flex justify-center space-x-3 mt-6">
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            state.filter === 'all'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            state.filter === 'active'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
            state.filter === 'completed'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
    </div>
  );
};

export default TaskList;