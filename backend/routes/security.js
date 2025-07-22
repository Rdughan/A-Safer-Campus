const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Added User model import

// A middleware to check if the user is an admin/security personnel would go here
// For now, we'll just use the standard auth middleware

// GET /api/security/reports - Get all reports for analysis
router.get('/reports', auth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching all reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// GET /api/security/trends - Get reporting trends
router.get('/trends', auth, async (req, res) => {
  try {
    const trends = await Report.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);
    res.json(trends);
  } catch (err) {
    console.error('Error fetching trends:', err);
    res.status(500).json({ message: 'Failed to fetch trends' });
  }
});

// PUT /api/security/reports/:id/status - Update a report's status
router.put('/reports/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['verified', 'false'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    await report.save();

    if (report.userId) {
      const user = await User.findById(report.userId);
      if (user) {
        if (status === 'verified') {
          user.credibility += 1;
        } else if (status === 'false') {
          user.credibility -= 1;
        }
        await user.save();
      }
    }

    res.json({ message: 'Report status updated successfully' });
  } catch (err) {
    console.error('Error updating report status:', err);
    res.status(500).json({ message: 'Failed to update report status' });
  }
});

module.exports = router; 