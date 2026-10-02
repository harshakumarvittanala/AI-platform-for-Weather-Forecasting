/**
 * Multilingual NLP & Dialog Context Service
 * Handles Intent Classification, Entity Extraction, Language Detection, and Context Retention
 */

// In-memory conversation session store
const sessions = new Map();

/**
 * Detect language of the input query
 */
function detectLanguage(text = '') {
  const teluguRegex = /[\u0C00-\u0C7F]/;
  const devanagariRegex = /[\u0900-\u097F]/; // Hindi, Marathi
  const tamilRegex = /[\u0B80-\u0BFF]/;
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  const bengaliRegex = /[\u0980-\u09FF]/;

  if (teluguRegex.test(text)) return 'te';
  if (tamilRegex.test(text)) return 'ta';
  if (kannadaRegex.test(text)) return 'kn';
  if (bengaliRegex.test(text)) return 'bn';
  if (devanagariRegex.test(text)) {
    // Specific Marathi keywords (पाऊस, हवामान, शेतकरी, उद्या, सांगा)
    if (/पाऊस|हवामान|शेतकरी|उद्या|सांगा|कसा/.test(text)) return 'mr';
    return 'hi';
  }
  return 'en';
}

/**
 * Common Indian city dictionary for entity extraction
 */
const KNOWN_LOCATIONS = [
  'hyderabad', 'delhi', 'new delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai', 
  'kolkata', 'vijayawada', 'guntur', 'visakhapatnam', 'vizag', 'pune', 'ahmedabad', 
  'jaipur', 'lucknow', 'kanpur', 'patna', 'bhubaneswar', 'kochi', 'coimbatore', 
  'madurai', 'warangal', 'tirupati', 'kurnool', 'rajahmundry', 'kakinada', 'nellore',
  'nagpur', 'indore', 'bhopal', 'chandigarh', 'amritsar', 'srinagar', 'shimla',
  'guwahati', 'shillong', 'ranchi', 'raipur', 'dehradun', 'varanasi', 'agra', 'surat'
];

/**
 * Extract intent and entities from user query
 */
function parseQuery(query = '', sessionContext = {}) {
  const text = query.trim();
  const lower = text.toLowerCase();
  const lang = detectLanguage(text);

  // 1. Extract Location
  let location = null;
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc)) {
      location = loc.charAt(0).toUpperCase() + loc.slice(1);
      break;
    }
  }

  // Fallback to location regex patterns (e.g. "in <Location>", "at <Location>", "for <Location>")
  if (!location) {
    const locMatch = lower.match(/(?:in|at|for|near|around|लोकेशन|स्थान|నగరంలో|ప్రాంతంలో)\s+([a-zA-Z\u0900-\u0CFF]+)/);
    if (locMatch && locMatch[1] && locMatch[1].length > 2) {
      location = locMatch[1].trim();
    }
  }

  // If no location detected in current prompt, inherit from session context
  if (!location && sessionContext.lastLocation) {
    location = sessionContext.lastLocation;
  }

  // 2. Extract Time Target
  let timeTarget = 'today';
  if (lower.includes('tomorrow') || lower.includes('कल') || lower.includes('రేపు') || lower.includes('நாளை') || lower.includes('उद्या')) {
    timeTarget = 'tomorrow';
  } else if (lower.includes('7 day') || lower.includes('week') || lower.includes('హప్తా') || lower.includes('వారంలో') || lower.includes('सप्ताह')) {
    timeTarget = '7days';
  } else if (lower.includes('yesterday') || lower.includes('గత') || lower.includes('बीते')) {
    timeTarget = 'past';
  }

  // 3. Classify Primary Intent
  let intent = 'WEATHER_CURRENT';

  // Agriculture keywords
  if (
    lower.includes('farm') || lower.includes('crop') || lower.includes('irrigat') || 
    lower.includes('spray') || lower.includes('pesticid') || lower.includes('fertiliz') || 
    lower.includes('sow') || lower.includes('paddy') || lower.includes('cotton') ||
    lower.includes('किसान') || lower.includes('खेती') || lower.includes('फसल') || lower.includes('सिंचाई') || lower.includes('कीटनाशक') ||
    lower.includes('వ్యవసాయ') || lower.includes('రైతు') || lower.includes('పంట') || lower.includes('నీరు') || lower.includes('మందులు') || lower.includes('వరి') ||
    lower.includes('விவசாய') || lower.includes('பயிர்') || lower.includes('பாசனம்')
  ) {
    intent = 'AGRICULTURE_ADVISORY';
  }
  // Marine & Fishermen keywords
  else if (
    lower.includes('fish') || lower.includes('marine') || lower.includes('sea') || 
    lower.includes('ocean') || lower.includes('wave') || lower.includes('boat') ||
    lower.includes('नाव') || lower.includes('मछुआरे') || lower.includes('समुद्र') || lower.includes('लहर') ||
    lower.includes('చేప') || lower.includes('మత్స్యకార') || lower.includes('సముద్ర') || lower.includes('అలలు') ||
    lower.includes('மீனவ') || lower.includes('கடல்')
  ) {
    intent = 'FISHING_MARINE_ADVISORY';
  }
  // Aviation & Transport keywords
  else if (
    lower.includes('flight') || lower.includes('pilot') || lower.includes('airport') || 
    lower.includes('visibility') || lower.includes('crosswind') || lower.includes('runway') ||
    lower.includes('उड़ान') || lower.includes('हवाई') || lower.includes('विमान')
  ) {
    intent = 'AVIATION_ADVISORY';
  }
  // Disaster Management & Alerts keywords
  else if (
    lower.includes('alert') || lower.includes('warning') || lower.includes('cyclone') || 
    lower.includes('flood') || lower.includes('heatwave') || lower.includes('disaster') || 
    lower.includes('ndrf') || lower.includes('siren') || lower.includes('danger') ||
    lower.includes('अलर्ट') || lower.includes('चेतावनी') || lower.includes('तूफान') || lower.includes('बाढ़') || lower.includes('लू') ||
    lower.includes('హెచ్చరిక') || lower.includes('తుఫాను') || lower.includes('వరద') || lower.includes('ప్రమాదం') || lower.includes('అలర్ట్') ||
    lower.includes('எச்சரிக்கை') || lower.includes('புயல்') || lower.includes('வெள்ளம்')
  ) {
    intent = 'ALERT_CHECK';
  }
  // Climate trends & Historical data
  else if (
    lower.includes('climate') || lower.includes('trend') || lower.includes('history') || 
    lower.includes('warming') || lower.includes('anomaly') || lower.includes('30 year') || lower.includes('monsoon shift') ||
    lower.includes('जलवायु') || lower.includes('इतिहास') || lower.includes('వాతావరణ మార్పు')
  ) {
    intent = 'CLIMATE_TRENDS';
  }
  // Forecast request
  else if (timeTarget === 'tomorrow' || timeTarget === '7days' || lower.includes('forecast') || lower.includes('भविष्यवाणी') || lower.includes('అంచనా')) {
    intent = 'WEATHER_FORECAST';
  }

  return {
    language: lang,
    intent,
    entities: {
      location: location || 'Current Location',
      timeTarget,
      rawQuery: query
    }
  };
}

/**
 * Manage conversation session state for context continuity
 */
function getOrCreateSession(sessionId = 'default') {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      id: sessionId,
      lastLocation: 'New Delhi',
      lastIntent: null,
      history: []
    });
  }
  return sessions.get(sessionId);
}

function updateSession(sessionId = 'default', updates = {}) {
  const session = getOrCreateSession(sessionId);
  if (updates.location) session.lastLocation = updates.location;
  if (updates.intent) session.lastIntent = updates.intent;
  if (updates.message) {
    session.history.push({
      timestamp: new Date().toISOString(),
      ...updates.message
    });
    // Keep last 10 messages for memory efficiency
    if (session.history.length > 10) {
      session.history.shift();
    }
  }
  return session;
}

module.exports = {
  detectLanguage,
  parseQuery,
  getOrCreateSession,
  updateSession
};
