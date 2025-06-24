import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

export const summarizeText = async (text) => {
  if (!text || text.trim().length === 0) {
    throw new Error('Empty text provided');
  }

  try {
    // Load the Universal Sentence Encoder model
    const model = await use.load();
    
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Encode sentences
    const embeddings = await model.embed(sentences);
    
    // Get importance scores for each sentence
    const scores = await calculateSentenceScores(embeddings);
    
    // Select top sentences for summary (30% of original or minimum 2 sentences)
    const summaryLength = Math.max(2, Math.ceil(sentences.length * 0.3));
    const topSentences = sentences
      .map((sentence, index) => ({ sentence, score: scores[index] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, summaryLength)
      .map(item => item.sentence);

    const summary = topSentences.join('. ').trim();

    return {
      original: text,
      summary: summary,
      type: detectIncidentType(text),
      location: extractLocation(text),
      severity: assessSeverity(text),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Summarization error:', error);
    throw new Error('Failed to process report');
  }
};

const calculateSentenceScores = async (embeddings) => {
  // Calculate cosine similarity between sentences
  const scores = await tf.tidy(() => {
    const normalized = tf.div(
      embeddings,
      tf.norm(embeddings, 2, 1, true)
    );
    return normalized.matMul(normalized.transpose());
  });
  
  return Array.from(await scores.data());
};

const detectIncidentType = (text) => {
  const types = {
    ROBBERY: ['steal', 'rob', 'theft', 'stolen', 'burglar'],
    ASSAULT: ['attack', 'fight', 'hit', 'hurt', 'assault'],
    FIRE: ['fire', 'smoke', 'burn', 'flame'],
    MEDICAL: ['injury', 'sick', 'hurt', 'medical', 'emergency'],
    SUSPICIOUS: ['suspicious', 'strange', 'stalking', 'following']
  };

  const loweredText = text.toLowerCase();
  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some(keyword => loweredText.includes(keyword))) {
      return type;
    }
  }
  
  return 'OTHER';
};

const extractLocation = (text) => {
  const locations = [
    'KNUST', 'Unity Hall', 'Republic Hall', 'Queens Hall',
    'Independence Hall', 'Africa Hall', 'Engineering', 'Library',
    'Faculty', 'Department', 'Lecture', 'Lab', 'Theater'
  ];

  const foundLocations = locations.filter(location => 
    text.toLowerCase().includes(location.toLowerCase())
  );

  return foundLocations.length > 0 ? foundLocations[0] : 'Unknown Location';
};

const assessSeverity = (text) => {
  const severityKeywords = {
    HIGH: ['emergency', 'critical', 'severe', 'urgent', 'dangerous'],
    MEDIUM: ['suspicious', 'concern', 'worried', 'unsafe'],
    LOW: ['notice', 'aware', 'minor', 'small']
  };

  const loweredText = text.toLowerCase();
  for (const [level, keywords] of Object.entries(severityKeywords)) {
    if (keywords.some(keyword => loweredText.includes(keyword))) {
      return level;
    }
  }

  return 'MEDIUM';
};

export default summarizeText;