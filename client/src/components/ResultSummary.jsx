import React from 'react';
import { Trophy, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

/**
 * ResultSummary Component
 * Displays final interview results with score breakdown
 */
export default function ResultSummary({
  totalScore,
  breakdown,
  summary,
  candidateName,
  onStartOver,
  onViewDetails,
}) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy size={40} className="text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl">Interview Complete!</CardTitle>
        <CardDescription>
          {candidateName ? `Great job, ${candidateName}!` : 'Great job!'} Here's your performance summary.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Score */}
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Overall Score</p>
          <p className={`text-6xl font-bold ${getScoreColor(totalScore)}`}>
            {totalScore}
          </p>
          <p className="text-2xl text-gray-600 mt-2">/ 100</p>
          <p className="text-lg font-medium text-gray-700 mt-3">
            {getScoreGrade(totalScore)}
          </p>
        </div>

        {/* Score Breakdown */}
        {breakdown && breakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <TrendingUp size={18} />
              <span>Performance Breakdown (6 Questions)</span>
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {breakdown.map((item, index) => {
                const questionNum = parseInt(item.questionId.replace('q', ''));
                const difficulty = questionNum <= 2 ? 'easy' : questionNum <= 4 ? 'medium' : 'hard';
                const difficultyColor = difficulty === 'easy' 
                  ? 'bg-green-100 text-green-800' 
                  : difficulty === 'medium' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800';
                
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-700">
                        Question {questionNum}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor}`}>
                        {difficulty}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-lg ${getScoreColor(item.score)}`}>
                        {item.score}/100
                      </span>
                      {item.score >= 70 ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Performance Summary</h4>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-gray-800 leading-relaxed">{summary}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          {onViewDetails && (
            <Button variant="outline" onClick={onViewDetails} className="flex-1">
              View Detailed Feedback
            </Button>
          )}
          {onStartOver && (
            <Button onClick={onStartOver} className="flex-1">
              Start New Interview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
