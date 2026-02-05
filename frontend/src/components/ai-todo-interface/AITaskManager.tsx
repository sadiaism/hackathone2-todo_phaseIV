import React, { useState, useEffect } from 'react';
import AICommandInput from './AICommandInput';
import AITaskDisplay from './AITaskDisplay';
import { Task } from './types';
import aiAgentService from '@/services/ai-agent-service';

interface AITaskManagerProps {
  userId: string;
  authToken: string;
}

const AITaskManager: React.FC<AITaskManagerProps> = ({ userId, authToken }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [responseType, setResponseType] = useState<'success' | 'error'>('success');

  // Set the auth token for the service
  useEffect(() => {
    if (authToken) {
      aiAgentService.setAuthToken(authToken);
    }
  }, [authToken]);

  // Function to fetch tasks (this would typically come from the AI response)
  const fetchTasks = async () => {
    setLoading(true);
    setError(undefined);

    try {
      // In a real implementation, we would call an endpoint to get tasks
      // For now, we'll simulate by calling the AI to list tasks
      const response = await aiAgentService.executeCommand({
        command: 'list my tasks',
        context: { user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      });

      if (response.data.status === 'success' && response.data.result) {
        // Handle different response formats based on the command
        if (response.data.result.type === 'list_tasks' && Array.isArray(response.data.result.task)) {
          // If the result contains tasks in the 'task' field (which may be an array)
          setTasks(response.data.result.task);
        } else if (response.data.result.task && !Array.isArray(response.data.result.task)) {
          // If the result contains a single task, convert it to an array
          setTasks([response.data.result.task]);
        } else {
          // Fallback: try to get tasks from the message or return empty array
          setTasks([]);
        }
      } else {
        setError(response.data.message || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching tasks');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle command submission
  const handleCommandSubmit = async (command: string) => {
    setLoading(true);
    setError(undefined);
    setResponseMessage(null);

    try {
      const response = await aiAgentService.executeCommand({ command });

      if (response.data.status === 'success') {
        setResponseType('success');
        setResponseMessage(response.data.result?.message || 'Command executed successfully');

        // Refresh tasks if the command might have changed them
        if (command.toLowerCase().includes('add') ||
            command.toLowerCase().includes('create') ||
            command.toLowerCase().includes('complete') ||
            command.toLowerCase().includes('delete') ||
            command.toLowerCase().includes('update')) {
          setTimeout(() => fetchTasks(), 500); // Small delay to allow DB to update
        }
      } else {
        setResponseType('error');
        setResponseMessage(response.data.message || 'Command failed');
      }
    } catch (err: any) {
      setResponseType('error');
      setError(err.message || 'Error executing command');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle task actions (complete, delete, etc.)
  const handleTaskAction = async (taskId: string, action: 'complete' | 'delete' | 'edit') => {
    setLoading(true);
    setError(undefined);
    setResponseMessage(null);

    try {
      let command = '';
      switch (action) {
        case 'complete':
          command = `complete task with id ${taskId}`;
          break;
        case 'delete':
          command = `delete task with id ${taskId}`;
          break;
        case 'edit':
          // For edit, we would need to open an editor, but for demo we'll just show a message
          setResponseMessage('Edit functionality would open an editor');
          setLoading(false);
          return;
      }

      const response = await aiAgentService.executeCommand({ command });

      if (response.data.status === 'success') {
        setResponseType('success');
        setResponseMessage(response.data.result?.message || `${action.charAt(0).toUpperCase() + action.slice(1)}d task successfully`);
        fetchTasks(); // Refresh the task list
      } else {
        setResponseType('error');
        setResponseMessage(response.data.message || `Failed to ${action} task`);
      }
    } catch (err: any) {
      setResponseType('error');
      setError(err.message || `Error ${action}ing task`);
    } finally {
      setLoading(false);
    }
  };

  // Function to validate commands before execution
  const validateCommand = async (command: string) => {
    try {
      const response = await aiAgentService.validateCommand({ command });

      if (response.data.status === 'success' && response.data.validation_result) {
        const validationResult = response.data.validation_result;

        if (!validationResult.valid) {
          setResponseMessage(`Command may not be understood. Did you mean to ${validationResult.parsed_intent}?`);
          setResponseType('error');
        }
      }
    } catch (err: any) {
      // Validation errors are okay, just means the command might not be valid
      console.warn('Command validation failed:', err);
    }
  };

  // Initial fetch of tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Todo Assistant</h1>
        <p className="text-gray-600">
          Use natural language to manage your tasks. The AI will interpret your commands and update your todo list.
        </p>
      </div>

      {/* Response message */}
      {responseMessage && (
        <div className={`mb-4 p-4 rounded-md ${
          responseType === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {responseType === 'success' ? (
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 11.414l1.293 1.293a1 1 0 101.414 1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${
                responseType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {responseMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
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
      )}

      {/* AI Command Input */}
      <div className="mb-8">
        <AICommandInput
          onCommandSubmit={(cmd) => {
            validateCommand(cmd); // Validate before submitting
            handleCommandSubmit(cmd);
          }}
          disabled={loading}
          placeholder="Ask your AI assistant to manage your tasks (e.g., 'add a task to buy groceries', 'show me my tasks', 'mark task 'meeting' as complete')..."
        />
      </div>

      {/* Task Display */}
      <div className="bg-white shadow rounded-lg p-6">
        <AITaskDisplay
          tasks={tasks}
          loading={loading}
          error={error}
          onTaskAction={handleTaskAction}
        />
      </div>
    </div>
  );
};

export default AITaskManager;