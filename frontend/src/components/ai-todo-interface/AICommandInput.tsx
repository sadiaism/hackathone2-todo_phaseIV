import React, { useState, useRef, KeyboardEvent } from 'react';

interface AICommandInputProps {
  onCommandSubmit: (command: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const AICommandInput: React.FC<AICommandInputProps> = ({
  onCommandSubmit,
  disabled = false,
  placeholder = 'Type a command for your AI assistant (e.g., "add a task to buy groceries")...'
}) => {
  const [command, setCommand] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (command.trim() && !disabled) {
      onCommandSubmit(command.trim());
      setCommand('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea as user types
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 150) + 'px'; // Max height of 150px
    setCommand(target.value);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto">
      <div className="relative rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
        <textarea
          ref={textareaRef}
          value={command}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={`w-full px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
          }`}
          style={{ minHeight: '48px', maxHeight: '150px' }}
        />
        <button
          onClick={handleSubmit}
          disabled={disabled || !command.trim()}
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-md ${
            disabled || !command.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }`}
          aria-label="Send command"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="mt-2 text-sm text-gray-500 text-center">
        Examples: &quot;Add a task to buy groceries&quot;, &quot;Show me my tasks&quot;, &quot;Mark task &apos;meeting&apos; as complete&quot;
      </div>
    </div>
  );
};

export default AICommandInput;