import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

/**
 * POST /api/save-progress
 * Save or update candidate progress during the interview
 * Can save: profile, pre-interview chat, questions, answers
 */
router.post('/save-progress', async (req, res) => {
  try {
    const {
      sessionId,
      profile,
      preInterviewChat,
      questions,
      resumeText,
      interviewStartedAt,
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Find existing candidate by session or create new one
    let candidate = await Candidate.findOne({ 
      $or: [
        { email: profile?.email },
        { sessionId: sessionId }
      ]
    }).sort({ createdAt: -1 }).limit(1);

    if (!candidate && profile?.name && profile?.email) {
      // Create new candidate record
      candidate = new Candidate({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        designation: profile.designation || '',
        location: profile.location || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        resumeText: resumeText || '',
        status: 'in-progress',
      });
    }

    if (!candidate) {
      return res.status(400).json({ error: 'Cannot create candidate without profile information' });
    }

    // Update profile if provided
    if (profile) {
      candidate.name = profile.name || candidate.name;
      candidate.email = profile.email || candidate.email;
      candidate.phone = profile.phone || candidate.phone;
      candidate.designation = profile.designation || candidate.designation;
      candidate.location = profile.location || candidate.location;
      candidate.github = profile.github || candidate.github;
      candidate.linkedin = profile.linkedin || candidate.linkedin;
    }

    // Update resume text if provided
    if (resumeText) {
      candidate.resumeText = resumeText;
    }

    // Save pre-interview chat messages
    if (preInterviewChat && Array.isArray(preInterviewChat)) {
      candidate.preInterviewChat = preInterviewChat.map(msg => ({
        sender: msg.sender,
        message: msg.text || msg.message,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      }));
    }

    // Save questions and answers
    if (questions && Array.isArray(questions)) {
      candidate.questions = questions.map((q, index) => ({
        questionId: q.questionId,
        questionNumber: index + 1, // Sequential number
        difficulty: q.difficulty,
        question: q.question,
        answer: q.answer || '',
        score: q.score || 0,
        feedback: q.feedback || '',
        timeLimit: q.timeLimit || 0,
        timeTaken: q.timeTaken || 0,
        answeredAt: q.answer ? new Date() : null,
      }));
    }

    // Set interview started time if provided
    if (interviewStartedAt && !candidate.interviewStartedAt) {
      candidate.interviewStartedAt = new Date(interviewStartedAt);
    }

    await candidate.save();

    res.json({
      success: true,
      message: 'Progress saved successfully',
      candidateId: candidate._id,
    });
  } catch (error) {
    console.error('Error saving candidate progress:', error);
    res.status(500).json({
      error: 'Failed to save progress',
      details: error.message,
    });
  }
});

/**
 * POST /api/update-chat
 * Update pre-interview chat messages
 */
router.post('/update-chat', async (req, res) => {
  try {
    const { email, chatMessages } = req.body;

    if (!email || !chatMessages) {
      return res.status(400).json({ error: 'Email and chat messages are required' });
    }

    // Find the most recent candidate by email
    const candidate = await Candidate.findOne({ email }).sort({ createdAt: -1 });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Update pre-interview chat
    candidate.preInterviewChat = chatMessages.map(msg => ({
      sender: msg.sender,
      message: msg.text || msg.message,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    await candidate.save();

    res.json({
      success: true,
      message: 'Chat updated successfully',
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({
      error: 'Failed to update chat',
      details: error.message,
    });
  }
});

export default router;
