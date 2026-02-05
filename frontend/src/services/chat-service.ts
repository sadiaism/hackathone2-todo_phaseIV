import { getToken, refreshTokenIfNeeded } from "@/utils/auth";

export interface SendMessageRequest {
  message: string;
  conversation_id?: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'ai';
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'error';
  message_type: 'text' | 'confirmation' | 'error' | 'system';
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'closed' | 'archived';
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  conversation_id: string;
  message: string;
  ai_response: string;
  timestamp: string;
  todo_action_result?: {
    action: string;
    todo_id?: string;
    todo_title?: string;
  };
}

export interface GetConversationsResponse {
  conversations: Conversation[];
  total_count: number;
  has_more: boolean;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
}

class ChatService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
  }

  async sendMessage(userId: string, request: SendMessageRequest): Promise<SendMessageResponse> {
    // Refresh token if needed before making the request
    await refreshTokenIfNeeded();

    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Check if the message is a task-related command
    const message = request.message.toLowerCase();

    // Check for task creation commands
    if ((message.includes('add') && message.includes('task')) || (message.includes('create') && message.includes('task'))) {
      return this.handleTaskCreation(userId, request.message, token);
    }

    // Check for task listing commands
    if ((message.includes('show') && message.includes('task')) || (message.includes('list') && message.includes('task')) || (message.includes('view') && message.includes('task'))) {
      return this.handleTaskListing(userId, request.message, token);
    }

    // Check for task deletion commands
    if ((message.includes('delete') || message.includes('remove')) && message.includes('task')) {
      return this.handleTaskDeletion(userId, request.message, token);
    }

    // Check for task update commands
    if ((message.includes('update') || message.includes('modify') || message.includes('change')) && message.includes('task')) {
      return this.handleTaskUpdate(userId, request.message, token);
    }

    // Check for task completion commands
    if (((message.includes('mark') || message.includes('complete') || message.includes('done')) && message.includes('task'))) {
      return this.handleTaskCompletion(userId, request.message, token);
    }

    // Default behavior - send to chat endpoint
    const response = await fetch(`${this.baseUrl}/api/${userId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: request.message,
        conversation_id: request.conversation_id
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private async handleTaskCreation(userId: string, message: string, token: string): Promise<SendMessageResponse> {
    try {
      // Extract task title from message
      const taskTitle = this.extractTaskTitle(message);

      // Create task using the task API
      const taskResponse = await fetch(`${this.baseUrl}/api/users/${userId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: `Created from chat: "${message}"`
        }),
      });

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json().catch(() => ({ message: 'Failed to create task' }));
        throw new Error(errorData.detail || 'Failed to create task');
      }

      const taskData = await taskResponse.json();

      return {
        conversation_id: userId, // Using user ID as conversation ID for simplicity
        message: message,
        ai_response: `I've created the task "${taskData.title}" for you. Task ID: ${taskData.id}`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'created',
          todo_id: taskData.id.toString(),
          todo_title: taskData.title
        }
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return {
        conversation_id: userId,
        message: message,
        ai_response: `Sorry, I couldn't create the task. Error: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'error',
          todo_title: this.extractTaskTitle(message)
        }
      };
    }
  }

  private async handleTaskListing(userId: string, message: string, token: string): Promise<SendMessageResponse> {
    try {
      // Get tasks using the task API
      const tasksResponse = await fetch(`${this.baseUrl}/api/users/${userId}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!tasksResponse.ok) {
        const errorData = await tasksResponse.json().catch(() => ({ message: 'Failed to get tasks' }));
        throw new Error(errorData.detail || 'Failed to get tasks');
      }

      const tasksData = await tasksResponse.json();
      const tasks = tasksData.tasks as Task[];

      if (tasks.length === 0) {
        return {
          conversation_id: userId,
          message: message,
          ai_response: "You don't have any tasks yet. You can create tasks by telling me something like 'Add a task to buy groceries'.",
          timestamp: new Date().toISOString(),
          todo_action_result: {
            action: 'list',
            todo_title: 'No tasks found'
          }
        };
      }

      const taskList = tasks.map(task => `- [${task.completed ? 'x' : ' '}] ${task.id}. ${task.title}`).join('\n');

      return {
        conversation_id: userId,
        message: message,
        ai_response: `Here are your tasks:\n${taskList}\n\nYou have ${tasks.length} task(s) in total.`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'list',
          todo_title: `${tasks.length} tasks retrieved`
        }
      };
    } catch (error) {
      console.error('Error listing tasks:', error);
      return {
        conversation_id: userId,
        message: message,
        ai_response: `Sorry, I couldn't retrieve your tasks. Error: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'error',
          todo_title: 'Failed to list tasks'
        }
      };
    }
  }

  private async handleTaskCompletion(userId: string, message: string, token: string): Promise<SendMessageResponse> {
    try {
      // Extract task ID from message
      const taskId = this.extractTaskId(message);

      if (!taskId) {
        return {
          conversation_id: userId,
          message: message,
          ai_response: "I couldn't identify which task to mark as complete. Please specify the task ID or title.",
          timestamp: new Date().toISOString(),
          todo_action_result: {
            action: 'error',
            todo_title: 'Task ID not found'
          }
        };
      }

      // Update task completion using the task API
      const taskResponse = await fetch(`${this.baseUrl}/api/users/${userId}/tasks/${taskId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: true
        }),
      });

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json().catch(() => ({ message: 'Failed to update task' }));
        throw new Error(errorData.detail || 'Failed to update task');
      }

      const taskData = await taskResponse.json();

      return {
        conversation_id: userId,
        message: message,
        ai_response: `I've marked the task "${taskData.title}" as complete.`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'completed',
          todo_id: taskData.id.toString(),
          todo_title: taskData.title
        }
      };
    } catch (error) {
      console.error('Error completing task:', error);
      return {
        conversation_id: userId,
        message: message,
        ai_response: `Sorry, I couldn't mark the task as complete. Error: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'error',
          todo_title: 'Failed to complete task'
        }
      };
    }
  }

  private async handleTaskDeletion(userId: string, message: string, token: string): Promise<SendMessageResponse> {
    try {
      // Extract task ID from message
      const taskId = this.extractTaskId(message);

      if (!taskId) {
        return {
          conversation_id: userId,
          message: message,
          ai_response: "I couldn't identify which task to delete. Please specify the task ID or title.",
          timestamp: new Date().toISOString(),
          todo_action_result: {
            action: 'error',
            todo_title: 'Task ID not found'
          }
        };
      }

      // Delete task using the task API
      const taskResponse = await fetch(`${this.baseUrl}/api/users/${userId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json().catch(() => ({ message: 'Failed to delete task' }));
        throw new Error(errorData.detail || 'Failed to delete task');
      }

      return {
        conversation_id: userId,
        message: message,
        ai_response: `I've successfully deleted the task with ID ${taskId}.`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'deleted',
          todo_id: taskId.toString(),
          todo_title: `Task ${taskId} deleted`
        }
      };
    } catch (error) {
      console.error('Error deleting task:', error);
      return {
        conversation_id: userId,
        message: message,
        ai_response: `Sorry, I couldn't delete the task. Error: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'error',
          todo_title: 'Failed to delete task'
        }
      };
    }
  }

  private async handleTaskUpdate(userId: string, message: string, token: string): Promise<SendMessageResponse> {
    try {
      // Extract task ID and new details from message
      const taskId = this.extractTaskId(message);
      const newTitle = this.extractUpdatedTaskDetails(message);

      if (!taskId) {
        return {
          conversation_id: userId,
          message: message,
          ai_response: "I couldn't identify which task to update. Please specify the task ID or title.",
          timestamp: new Date().toISOString(),
          todo_action_result: {
            action: 'error',
            todo_title: 'Task ID not found'
          }
        };
      }

      if (!newTitle) {
        return {
          conversation_id: userId,
          message: message,
          ai_response: "I couldn't determine what to update in the task. Please specify the new title or details.",
          timestamp: new Date().toISOString(),
          todo_action_result: {
            action: 'error',
            todo_title: 'Update details not found'
          }
        };
      }

      // Update task using the task API
      const taskResponse = await fetch(`${this.baseUrl}/api/users/${userId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle,
          description: `Updated from chat: "${message}"`
        }),
      });

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json().catch(() => ({ message: 'Failed to update task' }));
        throw new Error(errorData.detail || 'Failed to update task');
      }

      const taskData = await taskResponse.json();

      return {
        conversation_id: userId,
        message: message,
        ai_response: `I've updated the task to "${taskData.title}".`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'updated',
          todo_id: taskData.id.toString(),
          todo_title: taskData.title
        }
      };
    } catch (error) {
      console.error('Error updating task:', error);
      return {
        conversation_id: userId,
        message: message,
        ai_response: `Sorry, I couldn't update the task. Error: ${(error as Error).message}`,
        timestamp: new Date().toISOString(),
        todo_action_result: {
          action: 'error',
          todo_title: 'Failed to update task'
        }
      };
    }
  }

  private extractTaskTitle(message: string): string {
    // Try to extract the task title from messages like "Add task to buy groceries"
    const lowerMsg = message.toLowerCase();
    let title = message;

    // Remove common prefixes
    if (lowerMsg.startsWith('add a task to ') || lowerMsg.startsWith('add task to ')) {
      title = message.substring(lowerMsg.indexOf('to ') + 3);
    } else if (lowerMsg.startsWith('create a task to ') || lowerMsg.startsWith('create task to ')) {
      title = message.substring(lowerMsg.indexOf('to ') + 3);
    } else if (lowerMsg.includes('to ')) {
      title = message.substring(lowerMsg.indexOf('to ') + 3);
    } else if (lowerMsg.includes('that ')) {
      title = message.substring(lowerMsg.indexOf('that ') + 5);
    }

    // Clean up the title
    title = title.trim();
    if (title.endsWith('.')) title = title.slice(0, -1);

    return title || 'New Task';
  }

  private extractTaskId(message: string): number | null {
    // Extract numeric ID from message
    const matches = message.match(/\d+/);
    if (matches && matches.length > 0) {
      return parseInt(matches[0], 10);
    }
    return null;
  }

  private extractUpdatedTaskDetails(message: string): string | null {
    // Look for patterns like "change to <new title>" or "update to <new title>"
    const changeMatch = message.match(/(?:change to |update to |new title: )(.+)/i);
    if (changeMatch && changeMatch[1]) {
      return changeMatch[1].trim();
    }

    // Look for patterns like "update task <id> to <new title>"
    const updateMatch = message.match(/(?:update task|modify task).*?(?:to |as )(.+)/i);
    if (updateMatch && updateMatch[1]) {
      return updateMatch[1].trim();
    }

    return null;
  }

  async getConversation(userId: string, conversationId: string): Promise<Conversation> {
    // Refresh token if needed before making the request
    await refreshTokenIfNeeded();

    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${this.baseUrl}/api/${userId}/chat/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getUserConversations(userId: string, limit: number = 10, offset: number = 0): Promise<GetConversationsResponse> {
    // Refresh token if needed before making the request
    await refreshTokenIfNeeded();

    const token = await getToken();
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(
      `${this.baseUrl}/api/${userId}/chat?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

export const chatService = new ChatService();