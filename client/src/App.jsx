import React, { useState } from 'react';
import AppHeader from './components/AppHeader';
import IntervieweePage from './pages/IntervieweePage';
import InterviewerPage from './pages/InterviewerPage';

/**
 * Main App Component
 * Manages routing between Interviewee and Interviewer views
 */
function App() {
  const [activeTab, setActiveTab] = useState('interviewee');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pb-12">
        {activeTab === 'interviewee' ? (
          <IntervieweePage />
        ) : (
          <InterviewerPage />
        )}
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-gray-600">
        <p>SwipeX Interview Assistant © 2025 • Powered by Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;
