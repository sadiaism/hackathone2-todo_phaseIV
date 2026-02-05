import React from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
}

interface AITaskDisplayProps {
  tasks: Task[];
  loading?: boolean;
  error?: string;
  onTaskAction?: (taskId: string, action: 'complete' | 'delete' | 'edit') => void;
}

const AITaskDisplay: React.FC<AITaskDisplayProps> = ({
  tasks,
  loading = false,
  error,
  onTaskAction
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Processing your request...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new task using the AI assistant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">Your Tasks</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={`col-span-1 flex shadow-sm rounded-md ${
              task.status === 'completed' ? 'opacity-70' : ''
            }`}
          >
            <div className={`flex-1 flex items-center justify-between truncate rounded-r-md ${
              task.status === 'completed'
                ? 'bg-green-50 border border-green-200'
                : task.status === 'in-progress'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex-1 truncate px-4 py-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`} />
                  <span className={`font-medium truncate ${
                    task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.title}
                  </span>
                </div>
                {task.description && (
                  <p className="text-gray-500 truncate mt-1">{task.description}</p>
                )}
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>Status: {task.status.replace('-', ' ')}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col mr-2">
                {onTaskAction && task.status !== 'completed' && (
                  <button
                    onClick={() => onTaskAction(task.id, 'complete')}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Complete
                  </button>
                )}
                {onTaskAction && (
                  <button
                    onClick={() => onTaskAction(task.id, 'delete')}
                    className="mt-1 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AITaskDisplay;