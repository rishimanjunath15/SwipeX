import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

/**
 * POST /api/check-candidate
 * Check if a candidate with the given email exists in MongoDB
 * Used to verify if local Redux state should be cleared
 */
router.post('/check-candidate', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    const candidate = await Candidate.findOne({ email });

    res.json({
      exists: !!candidate,
      candidateId: candidate?._id || null,
    });
  } catch (error) {
    console.error('Check candidate error:', error);
    res.status(500).json({
      error: 'Failed to check candidate',
    });
  }
});

export default router;
