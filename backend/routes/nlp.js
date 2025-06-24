/**const express = require('express');
const router = express.Router();
// Import your summarization logic or connect to your ML API here

router.post('/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ message: 'Transcript is required' });
  }

  try {
    // Replace this with your actual backend summarization logic or ML API call
    const summary = await summarizeText(transcript); // or call your ML API
    res.json({ summary });
  } catch (err) {
    console.error('Summarization error:', err);
    res.status(500).json({ message: 'Failed to summarize transcript' });
  }
});

module.exports = router;**/

const express = require('express');
const router = express.Router();
const axios = require('axios'); // Import axios for HTTP requests

router.post('/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ message: 'Transcript is required' });
  }

  try {
    // Call your external ML API (FastAPI) for summarization
    const mlApiUrl = 'http://127.0.0.1:8000/summarize'; // Update if your ML API runs elsewhere
    const mlResponse = await axios.post(mlApiUrl, { transcript });
    const summary = mlResponse.data.summary;

    res.json({ summary });
  } catch (err) {
    console.error('Summarization error:', err);
    res.status(500).json({ message: 'Failed to summarize transcript' });
  }
});

module.exports = router;