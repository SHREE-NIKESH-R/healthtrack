const router = require('express').Router();
const auth = require('../middleware/auth');
const { getTodayRecord, getSummary, createOrUpdateRecord, getAllRecords } = require('../controllers/recordsController');
router.use(auth);
router.get('/today', getTodayRecord);
router.get('/summary', getSummary);
router.get('/', getAllRecords);
router.post('/', createOrUpdateRecord);
module.exports = router;
