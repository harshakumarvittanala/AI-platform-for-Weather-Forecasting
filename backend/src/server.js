const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const { searchLocation, getWeatherData } = require('./services/weatherService');
const { evaluateLocationAlerts, ACTIVE_REGIONAL_ALERTS, dispatchEmergencyAlert } = require('./services/alertService');
const { generateDecisionSupport } = require('./services/decisionSupportService');
const { getClimateAnalytics } = require('./services/climateAnalyticsService');
const { parseQuery, getOrCreateSession, updateSession } = require('./services/nlpService');
const { generateConversationalResponse } = require('./services/geminiService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------
// 1. Health & Status
// -----------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'MausamVani AI - Weather & Climate Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    supportedLanguages: ['en', 'hi', 'te', 'ta', 'kn', 'mr', 'bn'],
    features: [
      'Conversational AI Chatbot (Text + Voice)',
      'Real-Time Open-Meteo & IMD Calibration',
      'Early Warning Alerts (Red/Orange/Yellow/Green)',
      'Decision Support: Agriculture, Marine, Aviation, Disaster, Health',
      'Climate Analytics & 30-Year Trends',
      'Rural & Kisan Voice Mode'
    ]
  });
});

// -----------------------------------------------------------
// 2. Geocoding Location Search
// -----------------------------------------------------------
app.get('/api/locations/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const results = await searchLocation(query);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// 3. Real-Time Weather & Forecast
// -----------------------------------------------------------
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    let latitude = lat;
    let longitude = lon;
    let locationName = city || 'Current Location';

    if ((!latitude || !longitude) && city) {
      const locations = await searchLocation(city);
      if (locations && locations.length > 0) {
        latitude = locations[0].latitude;
        longitude = locations[0].longitude;
        locationName = `${locations[0].name}${locations[0].admin1 ? ', ' + locations[0].admin1 : ''}`;
      }
    }

    const weather = await getWeatherData(latitude, longitude, locationName);
    res.json(weather);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// 4. Weather Alerts & Early Warnings (IMD Standard)
// -----------------------------------------------------------
app.get('/api/alerts', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    const weather = await getWeatherData(lat, lon, city || 'Current Location');
    const locationAlerts = evaluateLocationAlerts(weather, weather.location.name);

    res.json({
      success: true,
      currentLocationAlerts: locationAlerts,
      nationalActiveAlerts: ACTIVE_REGIONAL_ALERTS
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dispatch Emergency Broadcast Alert (SMS/Push/WhatsApp)
app.post('/api/alerts/dispatch', (req, res) => {
  try {
    const { alertId, channel, phone, location } = req.body;
    const dispatchResult = dispatchEmergencyAlert({ alertId, channel, phone, location });
    res.json({ success: true, dispatch: dispatchResult });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// 5. Decision Support System (5 Operational Domains)
// -----------------------------------------------------------
app.get('/api/decision-support', async (req, res) => {
  try {
    const { lat, lon, city } = req.query;
    const weather = await getWeatherData(lat, lon, city || 'Target Area');
    const dss = generateDecisionSupport(weather, weather.location.name);
    res.json({ success: true, dss });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// 6. Climate Analytics & Decadal Trends
// -----------------------------------------------------------
app.get('/api/climate', (req, res) => {
  try {
    const region = req.query.region || 'India National';
    const climate = getClimateAnalytics(region);
    res.json({ success: true, climate });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -----------------------------------------------------------
// 7. Conversational AI Chat Endpoint (Text + Voice)
// -----------------------------------------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { 
      message, 
      sessionId = 'default-session', 
      userLocation = null, 
      language = 'auto', 
      customApiKey = null 
    } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Query message is required' });
    }

    const session = getOrCreateSession(sessionId);

    // Parse Intent & Entities
    const parsed = parseQuery(message, session);
    const targetLang = language !== 'auto' ? language : parsed.language;

    // Resolve location: entity in query > userLocation param > session history > default
    let targetLocationName = parsed.entities.location;
    let lat = userLocation?.latitude;
    let lon = userLocation?.longitude;

    if (targetLocationName && targetLocationName !== 'Current Location') {
      const found = await searchLocation(targetLocationName);
      if (found && found.length > 0) {
        lat = found[0].latitude;
        lon = found[0].longitude;
        targetLocationName = `${found[0].name}${found[0].admin1 ? ', ' + found[0].admin1 : ''}`;
      }
    }

    // Fetch real-time meteorological context
    const weatherData = await getWeatherData(lat, lon, targetLocationName);
    const alertData = evaluateLocationAlerts(weatherData, weatherData.location.name);
    const decisionSupport = generateDecisionSupport(weatherData, weatherData.location.name);

    // Call conversational generator (Gemini or native meteorological engine)
    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    const aiResponse = await generateConversationalResponse({
      query: message,
      parsed,
      weatherData,
      alertData,
      decisionSupport,
      language: targetLang,
      apiKey,
      sessionHistory: session.history
    });

    // Update session state
    updateSession(sessionId, {
      location: weatherData.location.name,
      intent: parsed.intent,
      message: {
        user: message,
        assistant: aiResponse.text,
        intent: parsed.intent
      }
    });

    res.json({
      success: true,
      query: message,
      detectedLanguage: parsed.language,
      intent: parsed.intent,
      response: aiResponse.text,
      source: aiResponse.source,
      suggestedQuestions: aiResponse.suggestedQuestions,
      weatherContext: {
        location: weatherData.location.name,
        temperature: weatherData.current.temperature,
        feelsLike: weatherData.current.feelsLike,
        condition: weatherData.current.condition,
        icon: weatherData.current.icon,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        aqi: weatherData.airQuality.aqi,
        rainProb: weatherData.daily[0]?.rainProbability || 0,
        alertSeverity: alertData.overallSeverity
      }
    });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve frontend build if in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) {
      res.send('MausamVani AI Backend API is running on port ' + PORT);
    }
  });
});

const server = app.listen(PORT, () => {
  console.log(`🌤️ MausamVani AI Backend active at http://localhost:${PORT}`);
  console.log(`📡 Ready to serve real-time weather, multilingual NLP, and decision support.`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`\n⚠️ Port ${PORT} is already in use by another instance.`);
    console.warn(`👉 MausamVani is already running! You can visit http://localhost:${PORT} in your browser.`);
    console.warn(`💡 If you want to force-restart it, run: npx kill-port ${PORT} or check Task Manager.\n`);
    process.exit(0);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

