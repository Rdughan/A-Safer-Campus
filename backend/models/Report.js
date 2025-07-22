const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  summary: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String, required: true },
  severity: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  originalText: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  coords:{lat:{type:Number},lng:{type:Number}},
  isAnonymous: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'verified', 'false'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Report', reportSchema);