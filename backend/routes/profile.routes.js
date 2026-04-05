const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProfile, createProfile, updateProfile } = require('../controllers/profileController');
router.use(auth);
router.get('/', getProfile);
router.post('/', createProfile);
router.put('/', updateProfile);
module.exports = router;
