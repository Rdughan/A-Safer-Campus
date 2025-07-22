const express = require('express');
const router = express.Router();

// GET /api/emergency/contacts - Get emergency contact information
router.get('/contacts', (req, res) => {
  const contacts = [
    { name: 'Campus Security', phone: '123-456-7890', type: 'Security' },
    { name: 'Emergency Medical Services', phone: '098-765-4321', type: 'Medical' },
    { name: 'Fire Department', phone: '555-555-5555', type: 'Fire' },
  ];
  res.json(contacts);
});

module.exports = router; 