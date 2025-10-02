import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, User, Mail, Phone, Award, Calendar, MessageSquare } from 'lucide-react';
import apiClient from '../lib/api';

/**
 * CandidateDetail Component
 * Shows full details of a candidate including all Q&A and feedback
 */
export default function CandidateDetail({ candidateId, onBack }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      {/* Back Button */}
      <Button onClick={onBack} variant="outline">
        <ArrowLeft size={16} className="mr-2" />
        Back to List
      </Button>

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

      {/* Questions and Answers */}
      {candidate.questions && candidate.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions & Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {candidate.questions.map((q, index) => (
                <div key={index} className="border-b last:border-b-0 pb-6 last:pb-0">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          Question {index + 1}
                        </span>
                        {q.difficulty && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              q.difficulty === 'easy'
                                ? 'bg-green-100 text-green-800'
                                : q.difficulty === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700">{q.question}</p>
                    </div>
                    <div className="ml-4">
                      <div
                        className={`px-3 py-1 rounded-full font-bold text-lg ${getScoreColor(
                          q.score
                        )} bg-gray-50`}
                      >
                        {q.score}/100
                      </div>
                    </div>
                  </div>

                  {/* Candidate Answer */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Candidate's Answer:</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {q.answer || 'No answer provided'}
                      </p>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  {q.feedback && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1 flex items-center space-x-1">
                        <MessageSquare size={16} />
                        <span>AI Feedback:</span>
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-gray-800">{q.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
