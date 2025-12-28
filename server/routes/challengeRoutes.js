const express = require('express');
const router = express.Router();
const {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  joinChallenge,
  completeChallenge,
  updateProgress,
  getMyChallenges,
  updateChallenge,
  deleteChallenge,
  getLeaderboard
} = require('../controllers/challengeController');
const authenticateToken = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllChallenges);
router.get('/leaderboard', getLeaderboard);
router.get('/:id', getChallengeById);

// Protected routes
router.use(authenticateToken);

router.post('/', createChallenge);
router.get('/user/my-challenges', getMyChallenges);
router.post('/:id/join', joinChallenge);
router.post('/:id/complete', completeChallenge);
router.put('/:id/progress', updateProgress);
router.put('/:id', updateChallenge);
router.delete('/:id', deleteChallenge);

module.exports = router;