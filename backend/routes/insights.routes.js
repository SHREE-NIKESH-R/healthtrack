const router = require('express').Router();
const auth = require('../middleware/auth');
const { getInsights } = require('../controllers/insightsController');
router.use(auth);
router.get('/', getInsights);
module.exports = router;
