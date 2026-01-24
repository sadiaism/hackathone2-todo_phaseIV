'use client';

import React, { useState } from 'react';
import { Task } from '../../app/lib/types';
import { useTasks } from '../../app/lib/api/task-context';
import { FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

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
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(task.id);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  return (
    <li className="py-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleCompletion}
          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />

        {isEditing ? (
          <div className="ml-3 flex-1">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded px-2 py-1 mb-1"
              disabled={loading}
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              rows={2}
              disabled={loading}
            />
          </div>
        ) : (
          <div className="ml-3 flex-1 min-w-0">
            <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-500'}`}>
                {task.description}
              </p>
            )}
          </div>
        )}

        <div className="ml-4 flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleEdit}
                disabled={loading}
                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                aria-label="Save task"
              >
                <FiSave />
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(task.title);
                  setEditDescription(task.description || '');
                }}
                disabled={loading}
                className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                aria-label="Cancel editing"
              >
                <FiX />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-800"
                aria-label="Edit task"
              >
                <FiEdit2 />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800"
                aria-label="Delete task"
              >
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export default TaskItem;