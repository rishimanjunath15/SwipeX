import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import Timer from './Timer';

/**
 * QuestionCard Component
 * Displays interview question with timer and answer input
 */
export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  timeLimit,
  onSubmit,
  disabled = false,
}) {
  const [answer, setAnswer] = useState('');
  const [timeExpired, setTimeExpired] = useState(false);

  // Auto-submit when time expires
  const handleTimeExpire = () => {
    setTimeExpired(true);
    onSubmit(answer);
  };

  const handleSubmit = () => {
    onSubmit(answer);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle>Question {questionNumber} of {totalQuestions}</CardTitle>
            {question.difficulty && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
            )}
          </div>
          
          {/* Timer Display */}
          {timeLimit && !timeExpired && (
            <Timer
              initialTime={timeLimit}
              onExpire={handleTimeExpire}
            />
          )}
        </div>
        <CardDescription>
          Take your time to answer thoroughly. Your response will be evaluated by AI.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Text */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-900 font-medium">{question.question}</p>
        </div>

        {/* Answer Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your Answer:</label>
          <Textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[200px]"
            disabled={disabled || timeExpired}
          />
          <p className="text-xs text-gray-500">
            {answer.length} characters
          </p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={disabled || timeExpired || !answer.trim()}
          className="w-full"
          size="lg"
        >
          {timeExpired ? 'Time Expired - Submitted' : 'Submit Answer'}
        </Button>

        {timeExpired && (
          <p className="text-sm text-amber-600 text-center">
            ⏱️ Time expired! Your answer has been automatically submitted.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
