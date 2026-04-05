const { startOfDay, endOfDay, subDays, format } = require('date-fns');
const DailyHealthRecord = require('../models/DailyHealthRecord');

exports.getTodayRecord = async (req, res) => {
  try {
    const today = new Date();
    const record = await DailyHealthRecord.findOne({
      userId: req.userId,
      date: { $gte: startOfDay(today), $lte: endOfDay(today) }
    });
    res.json(record || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const validDays = [7, 30, 90].includes(days) ? days : 7;
    const startDate = subDays(new Date(), validDays - 1);

    const records = await DailyHealthRecord.find({
      userId: req.userId,
      date: { $gte: startOfDay(startDate) }
    }).sort({ date: 1 });

    res.json({ days: validDays, count: records.length, records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrUpdateRecord = async (req, res) => {
  try {
    const today = new Date();
    const dateKey = startOfDay(today);

    const record = await DailyHealthRecord.findOneAndUpdate(
      { userId: req.userId, date: dateKey },
      { userId: req.userId, date: dateKey, ...req.body },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await DailyHealthRecord.countDocuments({ userId: req.userId });
    const records = await DailyHealthRecord.find({ userId: req.userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ total, page, totalPages: Math.ceil(total / limit), records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
