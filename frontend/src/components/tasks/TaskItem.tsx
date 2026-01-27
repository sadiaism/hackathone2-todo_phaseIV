'use client';

import React, { useState } from 'react';
import { Task } from '../../app/lib/types';
import { useTasks } from '../../app/lib/api/task-context';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [loading, setLoading] = useState(false);

  const handleToggleCompletion = async () => {
    try {
      await toggleTaskCompletion(task.id);
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      await updateTask(task.id, {
        title: editTitle,
        description: editDescription,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 group ${
      task.completed
        ? 'border-l-4 border-l-green-400 bg-gradient-to-r from-green-50/60 to-white/90 shadow-green-100/30'
        : 'border-l-4 border-l-blue-400 bg-gradient-to-r from-white/90 to-blue-50/30 shadow-blue-100/30'
    }`}>
      <div className="flex items-start">
        <button
          onClick={handleToggleCompletion}
          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center mr-4 mt-0.5 transition-all duration-200 ${
            task.completed
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white scale-110 shadow-lg shadow-green-500/30'
              : 'border-gray-300 hover:border-green-400 hover:scale-105 hover:shadow-md'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {isEditing ? (
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-lg font-semibold text-gray-900 bg-transparent border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 pb-1 mb-2 transition-all duration-200 placeholder:text-gray-400"
              disabled={loading}
              autoFocus
              placeholder="Task title..."
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full text-sm text-gray-600 bg-transparent border-b-2 border-blue-200 focus:outline-none focus:border-blue-500 pb-1 mb-3 resize-none transition-all duration-200 placeholder:text-gray-400"
              rows={2}
              disabled={loading}
              placeholder="Add details..."
            />
            <div className="flex space-x-3 mt-3">
              <button
                onClick={handleEdit}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
                aria-label="Save task"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(task.title);
                  setEditDescription(task.description || '');
                }}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-300 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 transform hover:scale-105"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className={`text-lg font-semibold transition-all duration-200 ${
              task.completed
                ? 'text-gray-500 line-through opacity-70'
                : 'text-gray-900 group-hover:text-blue-700'
            }`}>
              {task.title}
            </p>
            {task.description && (
              <p className={`text-sm mt-2 transition-all duration-200 ${
                task.completed
                  ? 'text-gray-400 line-through opacity-70'
                  : 'text-gray-600 group-hover:text-gray-700'
              }`}>
                {task.description}
              </p>
            )}
          </div>
        )}

        <div className="ml-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {!isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                aria-label="Edit task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                aria-label="Delete task"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};


export default TaskItem    

