import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Eye, Mail, Phone, Calendar, Award, Trash2 } from 'lucide-react';
import apiClient from '../lib/api';
import { removeSavedCandidate } from '../redux/candidateSlice';

/**
 * CandidateList Component
 * Displays table of all interviewed candidates (for Interviewer view)
 */
export default function CandidateList({ onSelectCandidate }) {
  const dispatch = useDispatch();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/candidates');
      setCandidates(response.data.candidates || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const handleDeleteClick = (candidateId) => {
    setConfirmDeleteId(candidateId);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async (candidateId) => {
    try {
      setDeletingId(candidateId);
      
      // Delete from MongoDB via API
      await apiClient.delete(`/api/candidate/${candidateId}`);
      
      // Remove from local state
      setCandidates(candidates.filter(c => c._id !== candidateId));
      
      // Remove from Redux store
      dispatch(removeSavedCandidate(candidateId));
      
      setConfirmDeleteId(null);
      setError(null);
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setError('Failed to delete candidate. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p>Loading candidates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="py-12">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={fetchCandidates} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Interview Candidates</CardTitle>
          <Button onClick={fetchCandidates} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {candidates.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>No candidates found.</p>
            <p className="text-sm mt-2">Candidates will appear here after completing interviews.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr
                    key={candidate._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{candidate.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Mail size={14} />
                          <span>{candidate.email}</span>
                        </div>
                        {candidate.phone && (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Phone size={14} />
                            <span>{candidate.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full font-semibold ${getScoreColor(
                          candidate.totalScore
                        )}`}
                      >
                        <Award size={14} />
                        <span>{candidate.totalScore}/100</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar size={14} />
                        <span>{formatDate(candidate.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        {confirmDeleteId === candidate._id ? (
                          // Show confirmation buttons
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleConfirmDelete(candidate._id)}
                              disabled={deletingId === candidate._id}
                            >
                              {deletingId === candidate._id ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelDelete}
                              disabled={deletingId === candidate._id}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          // Show view and delete buttons
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onSelectCandidate(candidate._id)}
                            >
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteClick(candidate._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={deletingId === candidate._id}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
