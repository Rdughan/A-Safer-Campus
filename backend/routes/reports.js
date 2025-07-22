const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const haversine = require('haversine-distance');
const fetch = require('node-fetch');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware to make auth optional
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization) {
        authMiddleware(req, res, next);
    } else {
        next();
    }
};

// POST /api/reports - Create a new report
router.post(
  '/',
  optionalAuth,
  [
    body('summary').notEmpty().withMessage('Summary is required'),
    body('type').notEmpty().withMessage('Type is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('severity').notEmpty().withMessage('Severity is required'),
    body('original').notEmpty().withMessage('Original text is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { summary, type, location, severity, original, timestamp, coords, isAnonymous } = req.body;

      const report = new Report({
        summary,
        type,
        location,
        severity,
        originalText: original,
        timestamp: timestamp || Date.now(),
        userId: isAnonymous ? null : req.userId,
        coords,
        isAnonymous
      });

      await report.save();

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

      res.status(201).json({ message: 'Report submitted', report, notified: messages.length });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to submit report or send notifications.' });
    }
  }
);

// GET /api/reports - Get all reports for the current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const reports = await Report.find({ userId }).sort({ timestamp: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching user reports:', err);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Heatmap endpoint: aggregates and scores reports by location
router.get('/heatmap', async (req, res) => {
    try {
      const reports = await Report.find();
  
      const severityScore = (severity) => {
        if (!severity) return 1;
        if (severity.toUpperCase() === 'HIGH') return 3;
        if (severity.toUpperCase() === 'MEDIUM') return 2;
        return 1; // LOW or unknown
      };
  
      const recencyScore = (timestamp) => {
        const days = (Date.now() - new Date(timestamp)) / (1000 * 60 * 60 * 24);
        return days <= 7 ? 1 : 0.5;
      };
  
      const locationScores = {};
      reports.forEach(report => {
        const loc = report.location || 'Unknown';
        if (!locationScores[loc]) {
          locationScores[loc] = { count: 0, danger: 0, safe: 0, coords: report.coords || null };
        }
        locationScores[loc].count += 1;
  
        const dangerTypes = ['ROBBERY', 'ASSAULT', 'FIRE', 'HARASSMENT'];
        const isDanger = dangerTypes.includes((report.type || '').toUpperCase());
        const sevScore = severityScore(report.severity);
        const recScore = recencyScore(report.timestamp);
  
        if (isDanger) {
          locationScores[loc].danger += sevScore * recScore;
        } else {
          locationScores[loc].safe += sevScore * recScore;
        }
  
        if (report.coords) locationScores[loc].coords = report.coords;
      });
  
      const heatmapData = Object.entries(locationScores).map(([location, data]) => ({
        location,
        ...data,
        score: data.danger - data.safe,
      }));
  
      res.json({ heatmap: heatmapData });
    } catch (err) {
      console.error('Heatmap error:', err);
      res.status(500).json({ message: 'Failed to generate heatmap' });
    }
  });

module.exports = router;