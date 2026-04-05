const router = require('express').Router();
const auth = require('../middleware/auth');
const { getStatus, chat } = require('../controllers/aiController');
router.use(auth);
router.get('/status', getStatus);
router.post('/chat', chat);
module.exports = router;
