'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/lib/auth/auth-context';
import ChatComponent from '@/components/ai-todo-interface/chat-component';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Todo Assistant</h1>
          <p className="text-gray-600">
            Chat naturally to manage your todos. Ask to add, update, or view your tasks.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '60vh' }}>
        <ChatComponent
          conversationId={conversationId}
          onConversationChange={setConversationId}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Examples</h3>
          <ul className="space-y-1">
            <li>• &quot;Add a task to buy groceries&quot;</li>
            <li>• &quot;Show me my tasks&quot;</li>
            <li>• &quot;Mark the shopping task as complete&quot;</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Tips</h3>
          <ul className="space-y-1">
            <li>• Be specific with your requests</li>
            <li>• You can ask to modify existing tasks</li>
            <li>• The conversation history persists after refresh</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Privacy</h3>
          <p>Your conversations are securely stored and accessible only to you.</p>
        </div>
      </div>
    </div>
  );
}