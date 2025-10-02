import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, User, Mail, Phone, Award, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import apiClient from '../lib/api';

/**
 * CandidateDetail Component
 * Shows full details of a candidate including all Q&A and feedback
 */
export default function CandidateDetail({ candidateId, onBack }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (candidateId) {
      fetchCandidateDetails();
    }
  }, [candidateId]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/candidate/${candidateId}`);
      setCandidate(response.data.candidate);
      setError(null);
    } catch (err) {
      console.error('Error fetching candidate details:', err);
      setError('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${candidate.name}'s interview? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      await apiClient.delete(`/api/candidate/${candidateId}`);
      
      alert('Candidate deleted successfully');
      onBack(); // Go back to list
    } catch (err) {
      console.error('Error deleting candidate:', err);
      alert('Failed to delete candidate. Please try again.');
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p>Loading candidate details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !candidate) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <p>{error || 'Candidate not found'}</p>
            <Button onClick={onBack} variant="outline" className="mt-4">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Back and Delete Buttons */}
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft size={16} className="mr-2" />
          Back to List
        </Button>
        
        <Button
          onClick={handleDelete}
          variant="destructive"
          disabled={deleting}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? 'Deleting...' : 'Delete Candidate'}
        </Button>
      </div>

      {/* Candidate Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{candidate.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{candidate.email}</p>
              </div>
            </div>
            {candidate.phone && (
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{candidate.phone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Interview Date</p>
                <p className="font-medium">{formatDate(candidate.createdAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Award size={24} className="text-primary" />
              <div>
                <p className="text-sm text-gray-500">Total Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(candidate.totalScore)}`}>
                  {candidate.totalScore}/100
                </p>
              </div>
            </div>
          </div>

          {candidate.summary && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">AI Summary</p>
              <p className="text-gray-800 leading-relaxed">{candidate.summary}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-Interview Chat */}
      {candidate.preInterviewChat && candidate.preInterviewChat.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-Interview Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {candidate.preInterviewChat.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions and Answers */}
      {candidate.questions && candidate.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions & Detailed Responses (Total: {candidate.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {candidate.questions.map((q, index) => {
                const questionNum = index + 1;
                const difficulty = q.difficulty || (questionNum <= 2 ? 'easy' : questionNum <= 4 ? 'medium' : 'hard');
                
                return (
                  <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                    {/* Question Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900 text-lg">
                            Question {questionNum} of 6
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              difficulty === 'easy'
                                ? 'bg-green-100 text-green-800'
                                : difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {difficulty.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-700 font-medium">{q.question}</p>
                      </div>
                      <div className="ml-4">
                        <div
                          className={`px-4 py-2 rounded-lg font-bold text-xl ${getScoreColor(
                            q.score
                          )} bg-gray-50 border-2 ${
                            q.score >= 80 ? 'border-green-200' : q.score >= 60 ? 'border-yellow-200' : 'border-red-200'
                          }`}
                        >
                          {q.score}/100
                        </div>
                      </div>
                    </div>

                    {/* Candidate Answer */}
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Candidate's Answer:</p>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {q.answer || '(No answer provided)'}
                        </p>
                      </div>
                    </div>

                    {/* AI Feedback */}
                    {q.feedback && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <MessageSquare size={16} />
                          <span>AI Evaluation Feedback:</span>
                        </p>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-gray-800 leading-relaxed">{q.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
