import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import CandidateList from '../components/CandidateList';
import CandidateDetail from '../components/CandidateDetail';
import { setSelectedCandidate } from '../redux/candidateSlice';

/**
 * InterviewerPage Component
 * Page for interviewers to view all candidates and their details
 */
export default function InterviewerPage() {
  const dispatch = useDispatch();
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId);
  };

  const handleBackToList = () => {
    setSelectedCandidateId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {selectedCandidateId ? (
        <CandidateDetail
          candidateId={selectedCandidateId}
          onBack={handleBackToList}
        />
      ) : (
        <CandidateList onSelectCandidate={handleSelectCandidate} />
      )}
    </div>
  );
}
