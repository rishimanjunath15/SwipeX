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
 * INTERVIEW QUESTION SEQUENCE (STRICT - Exactly 6 Questions)
 * ===========================================================
 * Question 1: EASY - Fundamentals (questionNumber: 1, index: 0)
 * Question 2: EASY - Basic concepts (questionNumber: 2, index: 1)
 * Question 3: MEDIUM - Intermediate topics (questionNumber: 3, index: 2)
 * Question 4: MEDIUM - Common patterns (questionNumber: 4, index: 3)
 * Question 5: HARD - Advanced concepts (questionNumber: 5, index: 4)
 * Question 6: HARD - Complex scenarios (questionNumber: 6, index: 5)
 * 
 * TOTAL: EXACTLY 6 questions (no more, no less)
 * DISTRIBUTION: 2 Easy + 2 Medium + 2 Hard
 * INDEXING: questionNumber (1-6) for display, index (0-5) for array
 * DATABASE: All questions saved with questionNumber field
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

  // Save chat messages to database (debounced)
  const saveChatToDatabase = useCallback(async (chatMessages) => {
    if (!candidate.email) return;
    
    try {
      await apiClient.post('/api/update-chat', {
        email: candidate.email,
        chatMessages: chatMessages,
      });
    } catch (error) {
      console.error('Failed to save chat:', error);
      // Don't show error to user, just log it
    }
  }, [candidate.email]);

  // Save interview progress to database
  const saveProgressToDatabase = useCallback(async (overrideQuestions = null) => {
    if (!candidate.email) return;
    
    try {
      await apiClient.post('/api/save-progress', {
        sessionId: interview.sessionId || Date.now().toString(),
        profile: candidate,
        preInterviewChat: messages.filter(m => interview.status !== 'interviewing'),
        questions: overrideQuestions || interview.questions,
        resumeText: interview.resumeText,
        interviewStartedAt: interview.startTime,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
      // Don't show error to user, just log it
    }
  }, [candidate, interview, messages]);

  // Add message to chat with optional delay for AI typing effect
  const addMessage = useCallback((sender, text, type = null, delay = 0) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    
    const newMessage = { sender, text, type, timestamp };
    
    if (sender === 'ai' && delay > 0) {
      setIsAiTyping(true);
      setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev, newMessage];
          // Save chat to database if profile exists
          if (candidate.email && interview.status !== 'interviewing') {
            saveChatToDatabase(updated);
          }
          return updated;
        });
        setIsAiTyping(false);
      }, delay);
    } else {
      setMessages((prev) => {
        const updated = [...prev, newMessage];
        // Save chat to database if profile exists
        if (candidate.email && interview.status !== 'interviewing') {
          saveChatToDatabase(updated);
        }
        return updated;
      });
    }
  }, [candidate.email, interview.status]);

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
      // Get previous questions to avoid topic repetition
      const previousQuestions = interview.questions.map(q => q.question).join('\n');
      
      const response = await apiClient.post('/api/interview-action', {
        action: 'next_question',
        payload: {
          questionNumber,
          difficulty,
          resumeText: interview.resumeText,
          previousQuestions, // Send previous questions to avoid repetition
        },
      });

      const questionData = response.data;
      
      // Ensure questionId and questionNumber are properly set
      questionData.questionId = `q${questionNumber}`;
      questionData.questionNumber = questionNumber; // Explicit sequential number (1-6)
      
      // Add question to Redux store
      dispatch(addQuestion(questionData));
      
      // Add delay to show AI is "thinking", then display question in chat
      setTimeout(() => {
        setIsAiTyping(false);
        // Don't add question to chat - it's displayed in QuestionCard component
        // addMessage('ai', questionData.question, 'question');
        setIsProcessing(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating question:', error);
      setIsAiTyping(false);
      setIsProcessing(false);
      dispatch(setError('Failed to generate question. Please try again.'));
    }
  }, [interview.resumeText, interview.questions, dispatch, addMessage]);

  // Start the interview process
  const startInterviewProcess = useCallback(() => {
    setReadyToBegin(false);
    setIsAiTyping(true);
    
    const sessionId = Date.now().toString();
    dispatch(startInterview({ sessionId }));
    
    // Save that interview has started
    saveProgressToDatabase();
    
    setTimeout(() => {
      setIsAiTyping(false);
      addMessage('ai', "Great! Let's begin the interview. You'll be asked 6 questions of varying difficulty. Good luck!");
      
      // Generate first question
      setTimeout(() => {
        generateNextQuestion(1, 'easy');
      }, 1000);
    }, 800);
  }, [dispatch, addMessage, generateNextQuestion, saveProgressToDatabase]);

  // Handle answer submission
  const handleAnswerSubmit = useCallback(async (answer) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const currentQ = interview.questions[interview.currentQuestionIndex];
    const timeTaken = Math.max(0, (currentQ?.timeLimit || 0) - (interview.timeRemaining || 0));

    // Save answer locally
    dispatch(updateQuestionAnswer({
      questionId: currentQ.questionId,
      answer,
      timeTaken,
    }));

    // Add question and answer to chat history
    const questionNum = interview.currentQuestionIndex + 1;
    addMessage('ai', `Q${questionNum}: ${currentQ.question}`, 'question');
    addMessage('user', answer || '(No answer provided)');
    setIsAiTyping(true);

    try {
      // Submit to server for evaluation
      // STRICT: Interview ends after exactly 6 questions
      const isLastQuestion = interview.currentQuestionIndex === 5 || interview.questions.length >= 6;
      
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

      // Build the latest snapshot of questions including this evaluation
      const answeredQuestion = {
        ...currentQ,
        answer,
        timeTaken,
        score: evalData.score,
        feedback: evalData.feedback,
      };

      const updatedQuestions = interview.questions.map((q) =>
        q.questionId === currentQ.questionId ? answeredQuestion : q
      );

      // Save progress to database after evaluation
      setTimeout(() => {
        saveProgressToDatabase(updatedQuestions);
      }, 500);

      // Show feedback with delay
      setTimeout(() => {
        setIsAiTyping(false);
        addMessage('ai', `Score: ${evalData.score}/100\n\n${evalData.feedback}`, 'eval');
        
        if (isLastQuestion) {
          // Generate final summary
          setTimeout(() => {
            generateFinalSummary(updatedQuestions);
          }, 1500);
        } else {
          // Calculate next question number
          const nextQuestionNumber = interview.currentQuestionIndex + 2; // +2 because: current (0-5) + 1 for next index + 1 for human numbering
          
          // STRICT DIFFICULTY DISTRIBUTION: 2 easy, 2 medium, 2 hard
          let nextDifficulty;
          if (nextQuestionNumber <= 2) {
            nextDifficulty = 'easy'; // Questions 1-2: EASY
          } else if (nextQuestionNumber <= 4) {
            nextDifficulty = 'medium'; // Questions 3-4: MEDIUM
          } else if (nextQuestionNumber <= 6) {
            nextDifficulty = 'hard'; // Questions 5-6: HARD
          } else {
            // Safety check: Should never reach here
            console.error('Attempted to generate more than 6 questions');
            return;
          }
          
          // Generate next question FIRST (this adds it to the array)
          // THEN move to next question index
          setTimeout(async () => {
            await generateNextQuestion(nextQuestionNumber, nextDifficulty);
            // After question is generated and added to array, move to next index
            setTimeout(() => {
              dispatch(nextQuestion());
            }, 500);
          }, 2000);
        }
      }, 1500);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      setIsAiTyping(false);
      setIsProcessing(false);
      dispatch(setError('Failed to evaluate answer. Please try again.'));
    }
  }, [isProcessing, interview.questions, interview.currentQuestionIndex, dispatch, addMessage, generateNextQuestion, saveProgressToDatabase]);

  // Generate final summary
  const generateFinalSummary = async (finalQuestions = null) => {
    try {
      const questionsForSummary = finalQuestions || interview.questions;
      const response = await apiClient.post('/api/generate-summary', {
        questions: questionsForSummary,
        candidateName: candidate.name,
      });

      const summaryData = response.data;
      
      dispatch(setFinalResults({
        totalScore: summaryData.totalScore,
        summary: summaryData.summary,
        breakdown: summaryData.breakdown,
      }));

      // Save to database
      await saveCandidateToDatabase(summaryData, questionsForSummary);
      
      addMessage('ai', 'Interview completed! Here are your results.');
    } catch (error) {
      console.error('Error generating summary:', error);
      dispatch(setError('Failed to generate final summary.'));
    }
  };

  // Save candidate data to database
  const saveCandidateToDatabase = async (summaryData, finalQuestions = null) => {
    try {
      // Ensure questions have sequential numbering
      const sourceQuestions = finalQuestions || interview.questions;
      const questionsWithNumbers = sourceQuestions.map((q, index) => ({
        ...q,
        questionNumber: index + 1,
        answeredAt: new Date().toISOString(),
      }));

      await apiClient.post('/api/save-candidate', {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        designation: candidate.designation,
        location: candidate.location,
        github: candidate.github,
        linkedin: candidate.linkedin,
        resumeText: interview.resumeText,
        questions: questionsWithNumbers,
        totalScore: summaryData.totalScore,
        summary: summaryData.summary,
        preInterviewChat: messages.filter(m => m.type !== 'question' && m.type !== 'eval'),
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
