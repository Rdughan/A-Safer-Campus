/*const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const auth = require('../middleware/auth'); 

// Optionally, add authentication middleware here if you want to protect this route
// const auth = require('../middleware/auth'); // Uncomment if you have auth middleware

// POST /api/reports - Create a new report
/*router.post('/',auth, async (req, res) => {
  try {
    const { summary, type, location, severity, original, timestamp } = req.body;

    // Basic validation
    if (!summary || !type || !location || !severity || !original) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const report = new Report({
      summary,
      type,
      location,
      severity,
      originalText: original,
      timestamp: timestamp || Date.now(),
      userId: req.userId || null
    });

    await report.save();
    res.status(201).json({ message: 'Report submitted', report });
  } catch (err) {
    console.error('Report submission error:', err);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

const { body, validationResult } = require('express-validator');

// POST /api/reports - Create a new report
router.post(
  '/',
  auth,
  [
    body('summary').notEmpty().withMessage('Summary is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('severity').notEmpty().withMessage('Severity is required'),
    body('original').notEmpty().withMessage('Original text is required'),
  ],
  async (req, res) => {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { summary, type, location, severity, original, timestamp } = req.body;

      const report = new Report({
        summary,
        type,
        location,
        severity,
        originalText: original,
        timestamp: timestamp || Date.now(),
        userId: req.userId
      });

      await report.save();
      res.status(201).json({ message: 'Report submitted', report });
    } catch (err) {
      console.error('Report submission error:', err);
      res.status(500).json({ message: 'Failed to submit report' });
    }
  }
);

// (Optional) GET /api/reports - List all reports
router.get('/',auth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Heatmap endpoint: aggregates and scores reports by location
router.get('/heatmap', async (req, res) => {
  try {
    // Fetch all reports
    const reports = await Report.find();

    // Helper: score severity
    const severityScore = (severity) => {
      if (!severity) return 1;
      if (severity.toUpperCase() === 'HIGH') return 3;
      if (severity.toUpperCase() === 'MEDIUM') return 2;
      return 1; // LOW or unknown
    };

    // Helper: score recency (last 7 days = 1, else 0.5)
    const recencyScore = (timestamp) => {
      const days = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24);
      return days <= 7 ? 1 : 0.5;
    };

    // Aggregate by location
    const locationScores = {};
    reports.forEach(report => {
      const loc = report.location || 'Unknown';
      if (!locationScores[loc]) {
        locationScores[loc] = { count: 0, danger: 0, safe: 0, coords: report.coords || null };
      }
      locationScores[loc].count += 1;

      // Score: danger types vs. safe types
      const dangerTypes = ['ROBBERY', 'ASSAULT', 'FIRE', 'HARASSMENT'];
      const isDanger = dangerTypes.includes((report.type || '').toUpperCase());
      const sevScore = severityScore(report.severity);
      const recScore = recencyScore(report.timestamp);

      if (isDanger) {
        locationScores[loc].danger += sevScore * recScore;
      } else {
        locationScores[loc].safe += sevScore * recScore;
      }

      // Optionally, update coords if present
      if (report.coords) locationScores[loc].coords = report.coords;
    });

    // Format for frontend heatmap
    const heatmapData = Object.entries(locationScores).map(([location, data]) => ({
      location,
      ...data,
      score: data.danger - data.safe, // positive = danger, negative = safe
    }));

    res.json({ heatmap: heatmapData });
  } catch (err) {
    console.error('Heatmap error:', err);
    res.status(500).json({ message: 'Failed to generate heatmap' });
  }
});


module.exports = router;*/

const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const haversine = require('haversine-distance'); // npm install haversine-distance
const fetch = require('node-fetch'); // npm install node-fetch
const authMiddleware = require('../middleware/auth'); // adjust path as needed

router.post('/', authMiddleware, async (req, res) => {
  try {
    // Save the report as usual
    const report = new Report(req.body);
    await report.save();

    const { coords } = req.body; // { lat, lng }

    // Find users with a location within 200 meters
    const users = await User.find({ expoPushToken: { $exists: true, $ne: null }, lastLocation: { $exists: true } });
    const nearbyUsers = users.filter(user => {
      if (!user.lastLocation || user.lastLocation.lat == null || user.lastLocation.lng == null) return false;
      const distance = haversine(
        { lat: coords.lat, lon: coords.lng },
        { lat: user.lastLocation.lat, lon: user.lastLocation.lng }
      );
      return distance <= 200; // meters
    });

    // Prepare notifications
    const messages = nearbyUsers.map(user => ({
      to: user.expoPushToken,
      sound: 'default',
      title: 'Nearby Incident',
      body: 'A new safety report was submitted near your location.',
      data: { incident: req.body }
    }));

    // Send notifications in batch to Expo
    if (messages.length > 0) {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(messages)
      });
    }

    res.json({ success: true, notified: messages.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit report or send notifications.' });
  }
});

module.exports = router;