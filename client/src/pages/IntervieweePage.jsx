import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ResumeUpload from '../components/ResumeUpload';
import ChatWindow from '../components/ChatWindow';
import QuestionCard from '../components/QuestionCard';
import ResultSummary from '../components/ResultSummary';
import WelcomeBackModal from '../components/WelcomeBackModal';
import CandidateProfile from '../components/CandidateProfile';
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
 * INTERVIEW QUESTION SEQUENCE (Consistent across all views)
 * =========================================================
 * Question 1: EASY - Fundamentals
 * Question 2: EASY - Basic concepts
 * Question 3: MEDIUM - Intermediate topics
 * Question 4: MEDIUM - Common patterns
 * Question 5: HARD - Advanced concepts
 * Question 6: HARD - Complex scenarios
 * 
 * Total: 6 questions
 * Focus: Theory-based with simple code examples only
 * Evaluation: Logic and understanding over syntax
 */

/**
 * IntervieweePage Component
 * Main page for candidates taking the interview
 */
export default function IntervieweePage() {
  const dispatch = useDispatch();
  const interview = useSelector((state) => state.interview);
  const candidate = useSelector((state) => state.candidate.profile);

  // State management
  const [messages, setMessages] = useState([]);
  const [fieldInput, setFieldInput] = useState('');
  const [processingField, setProcessingField] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [readyToBegin, setReadyToBegin] = useState(false);

  // Check for unfinished session on mount
  useEffect(() => {
    if (interview.status === 'interviewing' && interview.questions.length > 0) {
      setShowWelcomeBack(true);
    } else if (interview.status === 'idle' && interview.error) {
      // Clear any stale errors when starting fresh
      dispatch(clearError());
    }
  }, []);

  // Add message to chat with optional delay for AI typing effect
  const addMessage = useCallback((sender, text, type = null, delay = 0) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    if (sender === 'ai' && delay > 0) {
      setIsAiTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender, text, type, timestamp }]);
        setIsAiTyping(false);
      }, delay);
    } else {
      setMessages((prev) => [...prev, { sender, text, type, timestamp }]);
    }
  }, []);

  // Handle resume upload success
  const handleUploadSuccess = useCallback(async (data) => {
    const { fields, missing, message, resumeText } = data;

    dispatch(setResumeText(resumeText));
    dispatch(setProfile(fields));

    // Add AI message to chat with typing effect
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      if (message) {
        addMessage('ai', message);
      } else {
        addMessage('ai', 'Resume uploaded successfully! I\'ve extracted your information.');
      }

      if (missing && missing.length > 0) {
        dispatch(setMissingFields(missing));
        dispatch(setStatus('collecting-fields'));
        
        // Ask for first missing field
        const firstField = missing[0];
        setTimeout(() => {
          setIsAiTyping(true);
          setTimeout(() => {
            setIsAiTyping(false);
            addMessage(
              'ai',
              `I couldn't find your ${firstField} in the resume. Could you please share it?`,
              'ask_field'
            );
            setProcessingField(firstField);
          }, 800);
        }, 500);
      } else {
        // All fields present, wait for user to click "Let's Begin"
        setTimeout(() => {
          setIsAiTyping(true);
          setTimeout(() => {
            setIsAiTyping(false);
            addMessage('ai', 'Perfect! I have all the information I need. When you\'re ready, click "Let\'s Begin" to start the interview.');
            dispatch(setStatus('ready'));
            setReadyToBegin(true);
          }, 800);
        }, 1000);
      }
    }, 1000);
  }, [dispatch, addMessage]);

  // Handle missing field submission
  const handleFieldSubmit = useCallback(() => {
    if (!fieldInput.trim() || !processingField) return;

    const value = fieldInput.trim();
    dispatch(updateProfileField({ field: processingField, value }));
    dispatch(removeFieldFromMissing(processingField));

    addMessage('user', value);
    
    setIsAiTyping(true);
    setTimeout(() => {
      setIsAiTyping(false);
      addMessage('ai', `Thank you for providing your ${processingField}.`);

      setFieldInput('');

      // Check if more fields are missing
      const remainingFields = interview.missingFields.filter(
        (f) => f !== processingField
      );

      if (remainingFields.length > 0) {
        const nextField = remainingFields[0];
        setProcessingField(nextField);
        setTimeout(() => {
          setIsAiTyping(true);
          setTimeout(() => {
            setIsAiTyping(false);
            addMessage(
              'ai',
              `Could you also share your ${nextField}?`,
              'ask_field'
            );
          }, 800);
        }, 500);
      } else {
        // All fields collected, wait for user to click "Let's Begin"
        setProcessingField(null);
        setTimeout(() => {
          setIsAiTyping(true);
          setTimeout(() => {
            setIsAiTyping(false);
            addMessage('ai', 'Perfect! I have all the information I need. When you\'re ready, click "Let\'s Begin" to start the interview.');
            dispatch(setStatus('ready'));
            setReadyToBegin(true);
          }, 800);
        }, 500);
      }
    }, 800);
  }, [fieldInput, processingField, dispatch, interview.missingFields, addMessage]);

  // Generate next question
  const generateNextQuestion = useCallback(async (questionNumber, difficulty) => {
    setIsAiTyping(true);
    setIsProcessing(true);
    
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
      
      // Add delay to show AI is "thinking"
      setTimeout(() => {
        setIsAiTyping(false);
        addMessage('ai', questionData.question, 'question');
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating question:', error);
      setIsAiTyping(false);
      setIsProcessing(false);
      dispatch(setError('Failed to generate question. Please try again.'));
    }
  }, [interview.resumeText, dispatch, addMessage]);

  // Start the interview process
  const startInterviewProcess = useCallback(() => {
    setReadyToBegin(false);
    setIsAiTyping(true);
    
    dispatch(startInterview({ sessionId: Date.now().toString() }));
    
    setTimeout(() => {
      setIsAiTyping(false);
      addMessage('ai', "Great! Let's begin the interview. You'll be asked 6 questions of varying difficulty. Good luck!");
      
      // Generate first question
      setTimeout(() => {
        generateNextQuestion(1, 'easy');
      }, 1000);
    }, 800);
  }, [dispatch, addMessage, generateNextQuestion]);

  // Handle answer submission
  const handleAnswerSubmit = useCallback(async (answer) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const currentQ = interview.questions[interview.currentQuestionIndex];

    // Save answer locally
    dispatch(updateQuestionAnswer({
      questionId: currentQ.questionId,
      answer,
      timeTaken: currentQ.timeLimit - (interview.timeRemaining || 0),
    }));

    addMessage('user', answer || '(No answer provided)');
    setIsAiTyping(true);

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

      // Show feedback with delay
      setTimeout(() => {
        setIsAiTyping(false);
        addMessage('ai', `Score: ${evalData.score}/100\n\n${evalData.feedback}`, 'eval');
        
        if (isLastQuestion) {
          // Generate final summary
          setTimeout(() => {
            generateFinalSummary();
          }, 1500);
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
      }, 1500);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setIsAiTyping(false);
      setIsProcessing(false);
      dispatch(setError('Failed to evaluate answer. Please try again.'));
    }
  }, [isProcessing, interview.questions, interview.currentQuestionIndex, dispatch, addMessage, generateNextQuestion]);

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
        designation: candidate.designation,
        location: candidate.location,
        github: candidate.github,
        linkedin: candidate.linkedin,
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
            <CandidateProfile profile={candidate} />
            <ChatWindow messages={messages} isAiTyping={isAiTyping} />
            <div className="max-w-2xl mx-auto">
              <div className="flex space-x-2">
                <Input
                  value={fieldInput}
                  onChange={(e) => setFieldInput(e.target.value)}
                  placeholder={`Enter your ${processingField}...`}
                  onKeyPress={(e) => e.key === 'Enter' && handleFieldSubmit()}
                  disabled={isAiTyping}
                />
                <Button onClick={handleFieldSubmit} disabled={isAiTyping}>
                  Submit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Ready to Begin State */}
        {interview.status === 'ready' && readyToBegin && (
          <div className="space-y-6">
            <CandidateProfile profile={candidate} />
            <ChatWindow messages={messages} isAiTyping={isAiTyping} />
            <div className="max-w-2xl mx-auto flex justify-center">
              <Button 
                onClick={startInterviewProcess}
                disabled={isAiTyping}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold"
              >
                Let's Begin
              </Button>
            </div>
          </div>
        )}

        {/* Interviewing State */}
        {interview.status === 'interviewing' && interview.questions.length > 0 && (
          <div className="space-y-6">
            <CandidateProfile profile={candidate} />
            <ChatWindow messages={messages} isAiTyping={isAiTyping} />
            
            {interview.currentQuestionIndex < interview.questions.length && !isProcessing && (
              <QuestionCard
                question={interview.questions[interview.currentQuestionIndex]}
                questionNumber={interview.currentQuestionIndex + 1}
                totalQuestions={6}
                timeLimit={interview.questions[interview.currentQuestionIndex].timeLimit}
                onSubmit={handleAnswerSubmit}
                disabled={isProcessing}
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
