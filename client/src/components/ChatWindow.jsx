import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';
import { Card } from './ui/card';

/**
 * ChatWindow Component
 * Displays conversation between AI and candidate
 */
export default function ChatWindow({ messages }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Interview Chat</h3>
        
        {/* Messages Container */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No messages yet. Upload your resume to start the interview.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {/* Message Type Label (for system messages) */}
                    {msg.type && (
                      <div className="text-xs opacity-75 mb-1">
                        {msg.type === 'question' && '❓ Interview Question'}
                        {msg.type === 'eval' && '✅ Feedback'}
                        {msg.type === 'ask_field' && '📋 Information Needed'}
                      </div>
                    )}
                    
                    {/* Message Text */}
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Timestamp */}
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </Card>
  );
}
