import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

/**
 * POST /api/save-candidate
 * Save complete candidate interview data to MongoDB
 */
router.post('/save-candidate', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      designation,
      location,
      github,
      linkedin,
      resumeText,
      questions,
      totalScore,
      summary,
      preInterviewChat,
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        error: 'Name and email are required',
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        error: 'Interview questions and answers are required',
      });
    }

    // Calculate actual total score from questions as backup
    const validScores = questions
      .map(q => q.score)
      .filter(score => typeof score === 'number' && score >= 0 && score <= 100);
    
    const calculatedScore = validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;
    
    // Use calculated score if provided totalScore is 0 or invalid
    const finalTotalScore = (totalScore && totalScore > 0) ? totalScore : calculatedScore;
    
    console.log('Saving candidate:', {
      name,
      email,
      providedScore: totalScore,
      calculatedScore,
      finalScore: finalTotalScore,
      questionScores: questions.map(q => q.score)
    });

    // Create new candidate record
    const candidate = new Candidate({
      name,
      email,
      phone: phone || '',
      designation: designation || '',
      location: location || '',
      github: github || '',
      linkedin: linkedin || '',
      resumeText: resumeText || '',
      preInterviewChat: preInterviewChat || [],
      questions: questions.map((q, index) => ({
        ...q,
        questionNumber: q.questionNumber || index + 1,
      })),
      totalScore: finalTotalScore,
      summary: summary || '',
      status: 'completed',
      completedAt: new Date(),
    });

    await candidate.save();

    res.status(201).json({
      message: 'Candidate saved successfully',
      candidateId: candidate._id,
      candidate,
    });
  } catch (error) {
    console.error('Save candidate error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Invalid candidate data',
        details: error.message,
      });
    }
    
    res.status(500).json({
      error: 'Saving failed. Please try again.',
    });
  }
});

/**
 * PUT /api/update-candidate/:id
 * Update existing candidate record (for resume sessions)
 */
router.put('/update-candidate/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { ...updateData, completedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({
        error: 'Candidate not found',
      });
    }

    res.json({
      message: 'Candidate updated successfully',
      candidate,
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({
      error: 'Update failed. Please try again.',
    });
  }
});

export default router;
