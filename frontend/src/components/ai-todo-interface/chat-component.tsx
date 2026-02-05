'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/lib/auth/auth-context';
import { chatService, SendMessageRequest, Conversation, ChatMessage } from '@/services/chat-service';
import { FiSend } from 'react-icons/fi';

interface ChatComponentProps {
  conversationId?: string;
  onConversationChange?: (id: string) => void;
}

export default function ChatComponent({ conversationId: propConversationId, onConversationChange }: ChatComponentProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(propConversationId);
  const { state } = useAuth();
  const user = state.currentUser;  // Use currentUser from auth state
  const authIsLoading = state.isLoading;  // Track auth loading state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation if we have an ID and user is authenticated
  useEffect(() => {
    // Only proceed if auth is loaded and user is authenticated
    if (!state.isLoading && user?.id) {
      if (propConversationId) {
        loadConversation(propConversationId);
      } else {
        // Start a new conversation
        setMessages([]);
        setCurrentConversationId(undefined);
      }
    }
  }, [propConversationId, user?.id, state.isLoading]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async (id: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated before making the request
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }

      const response = await chatService.getConversation(user.id.toString(), id);
      setMessages(response.messages);
      setCurrentConversationId(id);
      onConversationChange?.(id);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get auth loading state
    const authIsLoading = state.isLoading;

    // Don't submit if input is empty, loading, or auth is still loading
    if (!inputValue.trim() || isLoading || authIsLoading) return;

    // Check if user is loaded and authenticated
    if (!user) {
      setError('Authentication is still loading. Please wait...');
      return;
    }

    if (!user.id) {
      setError('Please log in to use the chat feature');
      return;
    }

    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversationId || '',
      sender_type: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
      status: 'sent',
      message_type: 'text'
    };

    // Add user message optimistically
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const request: SendMessageRequest = {
        message: userInput,
        conversation_id: currentConversationId
      };

      const response = await chatService.sendMessage(user.id.toString(), request);

      // Update conversation ID if it's new
      if (!currentConversationId) {
        setCurrentConversationId(response.conversation_id);
        onConversationChange?.(response.conversation_id);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: response.conversation_id,
        sender_type: 'ai',
        content: response.ai_response,
        timestamp: response.timestamp,
        status: 'delivered',
        message_type: 'text'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');

      // Remove the optimistic user message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (error) {
      setError(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden" role="region" aria-label="Chat interface">
      {/* Chat Header */}
      <div className="bg-gray-100 px-4 py-3 border-b" role="banner">
        <h2 className="text-lg font-semibold text-gray-800">Todo AI Assistant</h2>
        {currentConversationId && (
          <p className="text-sm text-gray-600">Conversation: {String(currentConversationId).substring(0, 8)}...</p>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" role="log" aria-live="polite">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center" role="alert" aria-live="assertive">
            <span className="mr-2">{error}</span>
            <button
              onClick={handleRetry}
              className="ml-2 text-red-700 hover:text-red-900 underline"
              aria-label="Retry the failed action"
            >
              Retry
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="mb-4">Start a conversation with the AI assistant</p>
            <p className="text-sm">Try asking:</p>
            <ul className="mt-2 text-sm text-left list-disc pl-5 space-y-1">
              <li>&quot;Add a todo to buy groceries&quot;</li>
              <li>&quot;Show me my tasks&quot;</li>
              <li>&quot;Mark my shopping task as complete&quot;</li>
            </ul>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender_type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.sender_type === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start" aria-label="AI is thinking..." role="status" aria-live="polite">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="flex space-x-2" aria-hidden="true">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t bg-white p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={state.isLoading || !user ? "Authentication loading..." : "Type your message here..."}
            disabled={isLoading || state.isLoading || !user?.id}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || state.isLoading || !user?.id}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 flex items-center justify-center hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Ask the AI to help manage your todos using natural language
        </p>
      </form>
    </div>
  );
}