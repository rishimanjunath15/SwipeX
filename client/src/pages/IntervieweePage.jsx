import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ResumeUpload from '../components/ResumeUpload';
import ChatWindow from '../components/ChatWindow';
import QuestionCard from '../components/QuestionCard';
import ResultSummary from '../components/ResultSummary';
import WelcomeBackModal from '../components/WelcomeBackModal';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import apiClient from '../lib/api';
import {
  setStatus,
  setResumeText,
  setMissingFields,
  removeFieldFromMissing,
  addQuestion,
  setCurrentAnswer,
  updateQuestionAnswer,
  updateQuestionEvaluation,
  nextQuestion,
  setFinalResults,
  setError,
  clearError,
  resetInterview,
  startInterview,
} from '../redux/interviewSlice';
import {
  setProfile,
  updateProfileField,
  clearProfile,
  addSavedCandidate,
} from '../redux/candidateSlice';

/**
 * IntervieweePage Component
 * Main page for candidates taking the interview
 */
export default function IntervieweePage() {
  const dispatch = useDispatch();
  const interview = useSelector((state) => state.interview);
  const candidate = useSelector((state) => state.candidate.profile);

  const [messages, setMessages] = useState([]);
  const [fieldInput, setFieldInput] = useState('');
  const [processingField, setProcessingField] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Check for unfinished session on mount
  useEffect(() => {
    if (interview.status === 'interviewing' && interview.questions.length > 0) {
      setShowWelcomeBack(true);
    } else if (interview.status === 'idle' && interview.error) {
      // Clear any stale errors when starting fresh
      dispatch(clearError());
    }
  }, []);

  // Add message to chat
  const addMessage = (sender, text, type = null) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setMessages((prev) => [...prev, { sender, text, type, timestamp }]);
  };

  // Handle resume upload success
  const handleUploadSuccess = async (data) => {
    const { fields, missing, message, resumeText } = data;

    dispatch(setResumeText(resumeText));
    dispatch(setProfile(fields));

    // Add AI message to chat
    if (message) {
      addMessage('ai', message);
    } else {
      addMessage('ai', 'Resume uploaded successfully!');
    }

    if (missing && missing.length > 0) {
      dispatch(setMissingFields(missing));
      dispatch(setStatus('collecting-fields'));
      
      // Ask for first missing field
      const firstField = missing[0];
      addMessage(
        'ai',
        `I couldn't find your ${firstField} in the resume. Could you please share it?`,
        'ask_field'
      );
      setProcessingField(firstField);
    } else {
      // All fields present, start interview
      startInterviewProcess();
    }
  };

  // Handle missing field submission
  const handleFieldSubmit = () => {
    if (!fieldInput.trim() || !processingField) return;

    const value = fieldInput.trim();
    dispatch(updateProfileField({ field: processingField, value }));
    dispatch(removeFieldFromMissing(processingField));

    addMessage('user', value);
    addMessage('ai', `Thank you for providing your ${processingField}.`);

    setFieldInput('');

    // Check if more fields are missing
    const remainingFields = interview.missingFields.filter(
      (f) => f !== processingField
    );

    if (remainingFields.length > 0) {
      const nextField = remainingFields[0];
      setProcessingField(nextField);
      addMessage(
        'ai',
        `Could you also provide your ${nextField}?`,
        'ask_field'
      );
    } else {
      // All fields collected, start interview
      setProcessingField(null);
      startInterviewProcess();
    }
  };

  // Start the interview process
  const startInterviewProcess = () => {
    dispatch(startInterview({ sessionId: Date.now().toString() }));
    addMessage('ai', "Great! Let's begin the interview. You'll be asked 6 questions of varying difficulty. Good luck!");
    
    // Generate first question
    generateNextQuestion(1, 'easy');
  };

  // Generate next question
  const generateNextQuestion = async (questionNumber, difficulty) => {
    try {
      const response = await apiClient.post('/api/interview-action', {
        action: 'next_question',
        payload: {
          questionNumber,
          difficulty,
          resumeText: interview.resumeText,
        },
      });

      const questionData = response.data;
      dispatch(addQuestion(questionData));
      
      addMessage('ai', questionData.question, 'question');
    } catch (error) {
      console.error('Error generating question:', error);
      dispatch(setError('Failed to generate question. Please try again.'));
    }
  };

  // Handle answer submission
  const handleAnswerSubmit = async (answer) => {
    if (submittingAnswer) return;

    setSubmittingAnswer(true);
    const currentQ = interview.questions[interview.currentQuestionIndex];

    // Save answer locally
    dispatch(updateQuestionAnswer({
      questionId: currentQ.questionId,
      answer,
      timeTaken: currentQ.timeLimit - (interview.timeRemaining || 0),
    }));

    addMessage('user', answer || '(No answer provided)');

    try {
      // Submit to server for evaluation
      const isLastQuestion = interview.currentQuestionIndex === 5;
      
      const response = await apiClient.post('/api/interview-action', {
        action: 'submit_answer',
        payload: {
          questionId: currentQ.questionId,
          question: currentQ.question,
          answer,
          difficulty: currentQ.difficulty,
          isLastQuestion,
        },
      });

      const evalData = response.data;
      
      // Update question with score and feedback
      dispatch(updateQuestionEvaluation({
        questionId: currentQ.questionId,
        score: evalData.score,
        feedback: evalData.feedback,
      }));

      // Show feedback
      addMessage('ai', `Score: ${evalData.score}/100\n\n${evalData.feedback}`, 'eval');

      if (isLastQuestion) {
        // Generate final summary
        setTimeout(() => {
          generateFinalSummary();
        }, 1000);
      } else {
        // Move to next question
        dispatch(nextQuestion());
        
        // Determine next difficulty
        const nextQuestionNumber = interview.currentQuestionIndex + 2;
        const nextDifficulty = nextQuestionNumber <= 2 ? 'easy' : nextQuestionNumber <= 4 ? 'medium' : 'hard';
        
        setTimeout(() => {
          generateNextQuestion(nextQuestionNumber, nextDifficulty);
        }, 2000);
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      dispatch(setError('Failed to evaluate answer. Please try again.'));
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Generate final summary
  const generateFinalSummary = async () => {
    try {
      const response = await apiClient.post('/api/generate-summary', {
        questions: interview.questions,
        candidateName: candidate.name,
      });

      const summaryData = response.data;
      
      dispatch(setFinalResults({
        totalScore: summaryData.totalScore,
        summary: summaryData.summary,
        breakdown: summaryData.breakdown,
      }));

      // Save to database
      await saveCandidateToDatabase(summaryData);
      
      addMessage('ai', 'Interview completed! Here are your results.');
    } catch (error) {
      console.error('Error generating summary:', error);
      dispatch(setError('Failed to generate final summary.'));
    }
  };

  // Save candidate data to database
  const saveCandidateToDatabase = async (summaryData) => {
    try {
      await apiClient.post('/api/save-candidate', {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        resumeText: interview.resumeText,
        questions: interview.questions,
        totalScore: summaryData.totalScore,
        summary: summaryData.summary,
      });
    } catch (error) {
      console.error('Error saving candidate:', error);
    }
  };

  // Handle start over
  const handleStartOver = () => {
    dispatch(resetInterview());
    dispatch(clearProfile());
    setMessages([]);
    setFieldInput('');
    setProcessingField(null);
    setShowWelcomeBack(false);
  };

  // Handle continue from welcome back modal
  const handleContinue = () => {
    setShowWelcomeBack(false);
    // Reconstruct messages from interview state
    // This is a simplified version - you can enhance it
    addMessage('ai', 'Welcome back! Continuing your interview...');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {showWelcomeBack && (
        <WelcomeBackModal
          onContinue={handleContinue}
          onStartOver={handleStartOver}
        />
      )}

      <div className="space-y-6">
        {/* Idle State - Show Resume Upload */}
        {interview.status === 'idle' && (
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={(error) => dispatch(setError(error))}
          />
        )}

        {/* Collecting Fields State */}
        {interview.status === 'collecting-fields' && processingField && (
          <div className="space-y-6">
            <ChatWindow messages={messages} />
            <div className="max-w-2xl mx-auto">
              <div className="flex space-x-2">
                <Input
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  placeholder={`Enter your ${processingField}...`}
                  onKeyPress={(e) => e.key === 'Enter' && handleFieldSubmit()}
                />
                <Button onClick={handleFieldSubmit}>Submit</Button>
              </div>
            </div>
          </div>
        )}

        {/* Interviewing State */}
        {interview.status === 'interviewing' && interview.questions.length > 0 && (
          <div className="space-y-6">
            <ChatWindow messages={messages} />
            
            {interview.currentQuestionIndex < interview.questions.length && (
              <QuestionCard
                question={interview.questions[interview.currentQuestionIndex]}
                questionNumber={interview.currentQuestionIndex + 1}
                totalQuestions={6}
                timeLimit={interview.questions[interview.currentQuestionIndex].timeLimit}
                onSubmit={handleAnswerSubmit}
                disabled={submittingAnswer}
              />
            )}
          </div>
        )}

        {/* Completed State */}
        {interview.status === 'completed' && (
          <div className="space-y-6">
            <ResultSummary
              totalScore={interview.totalScore}
              breakdown={interview.breakdown}
              summary={interview.summary}
              candidateName={candidate.name}
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {/* Error Display */}
        {interview.error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertDescription className="flex items-center justify-between">
              <span>{interview.error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearError())}
                className="ml-4"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
