const UserProfile = require('../models/UserProfile');

exports.getProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const existing = await UserProfile.findOne({ userId: req.userId });
    if (existing) return res.status(409).json({ error: 'Profile already exists. Use PUT to update.' });

    const profile = await UserProfile.create({ userId: req.userId, ...req.body });
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.userId },
      { ...req.body },
      { new: true, runValidators: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
