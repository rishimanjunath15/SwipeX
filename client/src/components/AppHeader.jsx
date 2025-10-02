import React from 'react';
import { Users, UserCheck } from 'lucide-react';

/**
 * AppHeader Component
 * Navigation header with tabs for Interviewee and Interviewer views
 */
export default function AppHeader({ activeTab, onTabChange }) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Title */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              SwipeX Interview Assistant
            </h1>
          </div>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onTabChange('interviewee')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'interviewee'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserCheck size={18} />
              <span>Interviewee</span>
            </button>
            <button
              onClick={() => onTabChange('interviewer')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'interviewer'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={18} />
              <span>Interviewer</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
