import express from 'express';
import Candidate from '../models/Candidate.js';

const router = express.Router();

/**
 * GET /api/candidates
 * Returns list of all candidates with basic info
 */
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .select('_id name email phone totalScore summary status createdAt completedAt')
      .sort({ createdAt: -1 }); // Most recent first

    res.json({
      candidates,
      count: candidates.length,
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      error: 'Failed to fetch candidates',
    });
  }
});

/**
 * GET /api/candidate/:id
 * Returns full candidate details including all Q&A
 */
router.get('/candidate/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        error: 'Candidate not found',
      });
    }

    res.json({
      candidate,
    });
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({
      error: 'Failed to fetch candidate details',
    });
  }
});

/**
 * DELETE /api/candidate/:id
 * Deletes a candidate and their interview data
 */
router.delete('/candidate/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findByIdAndDelete(id);

    if (!candidate) {
      return res.status(404).json({
        error: 'Candidate not found',
      });
    }

    res.json({
      message: 'Candidate deleted successfully',
      deletedCandidate: {
        id: candidate._id,
        name: candidate.name,
        email: candidate.email,
      },
    });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({
      error: 'Failed to delete candidate',
    });
  }
});

export default router;
