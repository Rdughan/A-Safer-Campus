const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// PUT /api/user/update - Update user profile
router.put(
  '/update',
  auth,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updates = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.phone) updates.phone = req.body.phone;
      if (req.body.password) updates.password = req.body.password; // Hash if needed

      const user = await User.findByIdAndUpdate(
        req.userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).select('-password'); // Don't return password

      if (!user) return res.status(404).json({ message: 'User not found' });

      res.json(user);
    } catch (err) {
      console.error('Profile update error:', err);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
);

module.exports = router;