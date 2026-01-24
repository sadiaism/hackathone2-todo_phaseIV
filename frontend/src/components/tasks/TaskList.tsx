'use client';

import React from 'react';
import { useTasks } from '../../lib/api/task-context';
import TaskItem from './TaskItem';
import Card from '../ui/Card';

const TaskList: React.FC = () => {
  const { state, setFilter } = useTasks();

  // Filter tasks based on the current filter
  const filteredTasks = state.tasks.filter(task => {
    if (state.filter === 'active') return !task.completed;
    if (state.filter === 'completed') return task.completed;
    return true; // 'all'
  });

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Your Tasks</h3>

      {state.loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : state.error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{state.error}</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          {state.filter === 'completed'
            ? 'No completed tasks yet.'
            : state.filter === 'active'
              ? 'No active tasks. Great job!'
              : 'No tasks yet. Add one to get started!'}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      {/* Filter controls */}
      <div className="flex justify-center space-x-2 mt-4">
        <button
          className={`px-3 py-1 text-sm rounded ${
            state.filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`px-3 py-1 text-sm rounded ${
            state.filter === 'active'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`px-3 py-1 text-sm rounded ${
            state.filter === 'completed'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>
    </Card>
  );
};

export default TaskList;