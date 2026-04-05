const router = require('express').Router();
const auth = require('../middleware/auth');
const { getDashboard, getScoreHistory, calculateToday } = require('../controllers/wellnessController');
router.use(auth);
router.get('/dashboard', getDashboard);
router.get('/score', getScoreHistory);
router.post('/calculate-today', calculateToday);
module.exports = router;
