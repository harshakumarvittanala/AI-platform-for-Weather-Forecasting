const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate intelligent conversational response
 * Combines live meteorological telemetry with Gemini LLM or native expert engine
 */
async function generateConversationalResponse({
  query,
  parsed,
  weatherData,
  alertData,
  decisionSupport,
  language = 'en',
  apiKey = process.env.GEMINI_API_KEY,
  sessionHistory = []
}) {
  const locName = weatherData.location?.name || parsed.entities.location || 'Your Area';
  const current = weatherData.current || {};
  const daily = weatherData.daily || [];
  const activeAlerts = alertData?.alerts || [];
  const primaryAlert = activeAlerts.find(a => a.severity !== 'GREEN') || activeAlerts[0];

  // Try calling Google Gemini LLM if API Key is configured
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are "MausamVani AI", an intelligent, empathetic, multi-domain Weather & Climate Intelligence Assistant for India.
You provide accurate, location-based weather forecasts, extreme weather warnings (IMD standard: Green, Yellow, Orange, Red), and specialized advisories for farmers, fishermen, aviation pilots, disaster response coordinators, and common citizens.
You are fluent in English, Hindi (हिन्दी), Telugu (తెలుగు), Tamil (தமிழ்), Kannada, Bengali, and Marathi.

CURRENT METEOROLOGICAL CONTEXT:
- Location: ${locName} (${weatherData.location?.latitude?.toFixed(4)}, ${weatherData.location?.longitude?.toFixed(4)})
- Temperature: ${current.temperature}°C (Feels like: ${current.feelsLike}°C)
- Weather Condition: ${current.condition}
- Humidity: ${current.humidity}% | Wind: ${current.windSpeed} km/h (Gusts: ${current.windGusts} km/h, Dir: ${current.windDirection}°)
- Air Quality: AQI ${weatherData.airQuality?.aqi} (${weatherData.airQuality?.category})
- Today's Rain Sum: ${daily[0]?.rainSum || 0} mm | Rain Probability: ${daily[0]?.rainProbability || 0}%
- Tomorrow's Max/Min: ${daily[1]?.tempMax || 32}°C / ${daily[1]?.tempMin || 22}°C, Rain: ${daily[1]?.rainProbability || 0}%
- Active Alert Level: ${alertData?.overallSeverity} - ${primaryAlert?.title}: ${primaryAlert?.description}
- Agriculture Advisory: ${decisionSupport?.agriculture?.irrigation?.recommendation} Spraying: ${decisionSupport?.agriculture?.spraying?.recommendation}
- Marine & Fishermen Status: ${decisionSupport?.marine?.fishingSafety} - ${decisionSupport?.marine?.advisory} Wave Height: ${decisionSupport?.marine?.waveHeight}
- Aviation Risk: ${decisionSupport?.aviation?.flightRisk} - ${decisionSupport?.aviation?.advisory}

INSTRUCTIONS:
1. Answer the user query directly and concisely.
2. Respond in the language of the user's query: ${language.toUpperCase()} (e.g. if the user asked in Telugu, reply in Telugu; if in Hindi, reply in Hindi; if in English, reply in English).
3. Always include actionable safety or operational guidance when applicable (e.g. irrigation timing, spray feasibility, sea venturing safety, storm alerts).
4. Keep the tone reassuring, professional, and accessible to common users and rural farmers.`;

      const prompt = `User Query: "${query}"\n\nPlease answer based on the real-time weather context provided above.`;
      const result = await model.generateContent([systemPrompt, prompt]);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        return {
          source: 'GEMINI_AI',
          text: text.trim(),
          suggestedQuestions: getSuggestedQuestions(parsed.intent, locName, language)
        };
      }
    } catch (llmError) {
      console.warn('Gemini LLM call failed or quota exceeded, falling back to Native Meteorological Engine:', llmError.message);
    }
  }

  // Built-in Native Meteorological Intelligence Engine (Zero external dependency fallback)
  return generateNativeExpertResponse({
    query,
    parsed,
    weatherData,
    alertData,
    decisionSupport,
    language,
    locName
  });
}

/**
 * Native Multi-domain Meteorological Expert Response Generator
 */
function generateNativeExpertResponse({ parsed, weatherData, alertData, decisionSupport, language, locName }) {
  const current = weatherData.current || {};
  const daily = weatherData.daily || [];
  const intent = parsed.intent;
  const target = parsed.entities.timeTarget;

  let text = '';
  const lang = language || parsed.language || 'en';

  if (intent === 'AGRICULTURE_ADVISORY') {
    if (lang === 'te') {
      text = `🌾 **${locName} కిసాన్ వాతావరణ సలహా:**\n` +
        `• **నీటిపారుదల:** ${decisionSupport.agriculture.irrigation.recommendationTelugu}\n` +
        `• **మందుల పిచికారీ:** ${decisionSupport.agriculture.spraying.recommendationTelugu}\n` +
        `• **గాలి వేగం & తేమ:** ${current.windSpeed} కి.మీ/గం | తేమ: ${current.humidity}%\n` +
        `• **వర్ష సూచన:** రాబోయే 48 గంటల్లో వర్షం పడే అవకాశం ${daily[0]?.rainProbability || 10}%.\n` +
        `• **రైతు సూచన:** నేలలో తేమ శాతం: ${decisionSupport.agriculture.soilMoistureEstimate}. పంటల ఆరోగ్యానికి ఇది అనుకూలమైన సమయం.`;
    } else if (lang === 'hi') {
      text = `🌾 **${locName} किसान कृषि परामर्श:**\n` +
        `• **सिंचाई सलाह:** ${decisionSupport.agriculture.irrigation.recommendationHindi}\n` +
        `• **कीटनाशक छिड़काव:** ${decisionSupport.agriculture.spraying.recommendationHindi}\n` +
        `• **हवा की गति व नमी:** ${current.windSpeed} किमी/घंटा | आर्द्रता: ${current.humidity}%\n` +
        `• **वर्षा की संभावना:** आज बारिश की संभावना ${daily[0]?.rainProbability || 10}% है।\n` +
        `• **विशेष टिप:** मृदा नमी स्तर लगभग ${decisionSupport.agriculture.soilMoistureEstimate} है।`;
    } else {
      text = `🌾 **Agricultural Decision Support for ${locName}:**\n` +
        `• **Irrigation:** ${decisionSupport.agriculture.irrigation.recommendation}\n` +
        `• **Pesticide/Fertilizer Spray:** ${decisionSupport.agriculture.spraying.recommendation}\n` +
        `• **Atmospheric Conditions:** Wind ${current.windSpeed} km/h (Gusts: ${current.windGusts} km/h) | Humidity ${current.humidity}%\n` +
        `• **Rainfall Outlook:** ${daily[0]?.rainProbability || 15}% probability of rain today (${daily[0]?.rainSum || 0} mm expected).\n` +
        `• **Soil Moisture Estimate:** ${decisionSupport.agriculture.soilMoistureEstimate} with evapotranspiration rate of ${decisionSupport.agriculture.evapotranspiration}.`;
    }
  } else if (intent === 'FISHING_MARINE_ADVISORY') {
    if (lang === 'te') {
      text = `🌊 **${locName} మత్స్యకార హెచ్చరిక (సాగర్ మిత్ర):**\n` +
        `• **భద్రతా స్థితి:** ${decisionSupport.marine.fishingSafety === 'SAFE' ? '✅ వేటకు అనుకూలం' : '⚠️ హెచ్చరిక / జాగ్రత్త'}\n` +
        `• **అలల ఎత్తు:** ${decisionSupport.marine.waveHeight} | సముద్ర గాలి: ${decisionSupport.marine.windKnots}\n` +
        `• **సలహా:** ${decisionSupport.marine.advisoryTelugu}\n` +
        `• **హార్బర్ సిగ్నల్:** ${decisionSupport.marine.harborSignal}`;
    } else if (lang === 'hi') {
      text = `🌊 **${locName} मछुआरा व समुद्री चेतावनी (सागर मित्र):**\n` +
        `• **सुरक्षा स्थिति:** ${decisionSupport.marine.fishingSafety === 'SAFE' ? '✅ सुरक्षित' : '⚠️ सावधानी आवश्यक'}\n` +
        `• **लहरों की ऊंचाई:** ${decisionSupport.marine.waveHeight} | हवा की गति: ${decisionSupport.marine.windKnots}\n` +
        `• **सलाह:** ${decisionSupport.marine.advisoryHindi}\n` +
        `• **बंदरगाह चेतावनी:** ${decisionSupport.marine.harborSignal}`;
    } else {
      text = `🌊 **Marine & Fisheries Advisory for ${locName}:**\n` +
        `• **Status:** ${decisionSupport.marine.fishingSafety === 'SAFE' ? '✅ SAFE TO SAIL' : '⚠️ CAUTION / PROHIBITED'}\n` +
        `• **Sea State:** ${decisionSupport.marine.seaState} | Wave Height: ${decisionSupport.marine.waveHeight}\n` +
        `• **Open Sea Winds:** ${decisionSupport.marine.windKnots}\n` +
        `• **Navigational Advisory:** ${decisionSupport.marine.advisory}\n` +
        `• **Harbor Cautionary Warning:** ${decisionSupport.marine.harborSignal}`;
    }
  } else if (intent === 'ALERT_CHECK') {
    const highest = alertData.alerts[0];
    if (lang === 'te') {
      text = `⚠️ **${locName} విపత్తు & వాతావరణ హెచ్చరికలు:**\n` +
        `• **స్థాయి:** ${alertData.overallSeverity} ALERT\n` +
        `• **శీర్షిక:** ${highest.title}\n` +
        `• **వివరణ:** ${highest.descriptionTelugu || highest.description}\n` +
        `• **తీసుకోవాల్సిన జాగ్రత్తలు:** ${highest.recommendedAction}\n` +
        `• **అత్యవసర సహాయవాణి:** ${highest.helpline}`;
    } else if (lang === 'hi') {
      text = `⚠️ **${locName} मौसम चेतावनी एवं आपदा प्रबंधन:**\n` +
        `• **अलर्ट स्तर:** ${alertData.overallSeverity} ALERT\n` +
        `• **विषय:** ${highest.title}\n` +
        `• **विवरण:** ${highest.descriptionHindi || highest.description}\n` +
        `• **आवश्यक कदम:** ${highest.recommendedAction}\n` +
        `• **आपातकालीन हेल्पलाइन:** ${highest.helpline}`;
    } else {
      text = `⚠️ **Weather Warning & Early Alert for ${locName}:**\n` +
        `• **Severity Level:** ${alertData.overallSeverity} ALERT\n` +
        `• **Hazard Type:** ${highest.type}\n` +
        `• **Bulletin:** ${highest.description}\n` +
        `• **Recommended Action:** ${highest.recommendedAction}\n` +
        `• **Emergency Contacts:** ${highest.helpline}`;
    }
  } else if (intent === 'WEATHER_FORECAST' || target === 'tomorrow') {
    const nextDay = daily[1] || daily[0];
    if (lang === 'te') {
      text = `📅 **${locName} రేపటి వాతావరణ సమాచారం:**\n` +
        `• **పరిస్థితి:** ${nextDay.condition}\n` +
        `• **గరిష్ట / కనిష్ట ఉష్ణోగ్రత:** ${nextDay.tempMax}°C / ${nextDay.tempMin}°C\n` +
        `• **వర్షం పడే అవకాశం:** ${nextDay.rainProbability}% (అంచనా వర్షపాతం: ${nextDay.rainSum} mm)\n` +
        `• **గాలి వేగం:** గరిష్టంగా ${nextDay.maxWind} కి.మీ/గం`;
    } else if (lang === 'hi') {
      text = `📅 **${locName} कल के मौसम का पूर्वानुमान:**\n` +
        `• **मौसम की स्थिति:** ${nextDay.condition}\n` +
        `• **अधिकतम / न्यूनतम तापमान:** ${nextDay.tempMax}°C / ${nextDay.tempMin}°C\n` +
        `• **बारिश की संभावना:** ${nextDay.rainProbability}% (संभावित बारिश: ${nextDay.rainSum} मिमी)\n` +
        `• **हवा की गति:** अधिकतम ${nextDay.maxWind} किमी/घंटा`;
    } else {
      text = `📅 **Forecast for ${locName} (${target === 'tomorrow' ? 'Tomorrow' : 'Upcoming Days'}):**\n` +
        `• **Condition:** ${nextDay.condition}\n` +
        `• **Temperature Range:** Max ${nextDay.tempMax}°C | Min ${nextDay.tempMin}°C\n` +
        `• **Precipitation Probability:** ${nextDay.rainProbability}% (Sum: ${nextDay.rainSum} mm)\n` +
        `• **Wind Peak:** Up to ${nextDay.maxWind} km/h\n` +
        `• **Sunrise / Sunset:** ${nextDay.sunrise?.split('T')[1] || '06:05'} AM / ${nextDay.sunset?.split('T')[1] || '18:20'} PM`;
    }
  } else {
    // Current weather
    if (lang === 'te') {
      text = `🌤️ **${locName} ప్రస్తుత వాతావరణం:**\n` +
        `• **ఉష్ణోగ్రత:** ${current.temperature}°C (అనిపించేది: ${current.feelsLike}°C)\n` +
        `• **వాతావరణ పరిస్థితి:** ${current.conditionTelugu || current.condition}\n` +
        `• **గాలిలో తేమ:** ${current.humidity}%\n` +
        `• **గాలి వేగం:** ${current.windSpeed} కి.మీ/గం\n` +
        `• **గాలి నాణ్యత (AQI):** ${weatherData.airQuality?.aqi} (${weatherData.airQuality?.category})\n` +
        `• **వర్ష సూచన:** నేడు వర్షం పడే అవకాశం ${daily[0]?.rainProbability || 10}%.`;
    } else if (lang === 'hi') {
      text = `🌤️ **${locName} में वर्तमान मौसम की स्थिति:**\n` +
        `• **तापमान:** ${current.temperature}°C (महसूस होने वाला: ${current.feelsLike}°C)\n` +
        `• **मौसम:** ${current.conditionHindi || current.condition}\n` +
        `• **आर्द्रता (नमी):** ${current.humidity}%\n` +
        `• **हवा की गति:** ${current.windSpeed} किमी/घंटा\n` +
        `• **वायु गुणवत्ता (AQI):** ${weatherData.airQuality?.aqi} (${weatherData.airQuality?.category})\n` +
        `• **बारिश की संभावना:** आज लगभग ${daily[0]?.rainProbability || 10}% है।`;
    } else {
      text = `🌤️ **Current Weather in ${locName}:**\n` +
        `• **Temperature:** ${current.temperature}°C (Feels like: ${current.feelsLike}°C)\n` +
        `• **Condition:** ${current.condition}\n` +
        `• **Humidity:** ${current.humidity}% | Surface Pressure: ${current.pressure} hPa\n` +
        `• **Wind:** ${current.windSpeed} km/h from ${current.windDirection}° (Gusts: ${current.windGusts} km/h)\n` +
        `• **Air Quality:** AQI ${weatherData.airQuality?.aqi} (${weatherData.airQuality?.category})\n` +
        `• **Rainfall Risk:** ${daily[0]?.rainProbability || 10}% chance of rain today.`;
    }
  }

  return {
    source: 'NATIVE_METEOROLOGY_ENGINE',
    text,
    suggestedQuestions: getSuggestedQuestions(intent, locName, lang)
  };
}

/**
 * Generate contextual follow-up questions
 */
function getSuggestedQuestions(intent, location, lang) {
  if (lang === 'te') {
    return [
      `రేపు ${location} లో వర్షం పడుతుందా?`,
      `ఈరోజు వరి పైరుకు ఎరువులు పిచికారీ చేయవచ్చా?`,
      `తీర ప్రాంతంలో తుఫాను లేదా వరద హెచ్చరికలు ఉన్నాయా?`,
      `సముద్రంలో చేపల వేటకు వెళ్లవచ్చా?`
    ];
  } else if (lang === 'hi') {
    return [
      `कल ${location} का मौसम कैसा रहेगा?`,
      `क्या आज फसलों पर कीटनाशक छिड़कना सुरक्षित है?`,
      `क्या कोई चक्रवात या भारी बारिश का अलर्ट है?`,
      `समुद्र में मछुआरों के लिए क्या सलाह है?`
    ];
  }
  return [
    `Will it rain tomorrow in ${location}?`,
    `Is it safe to spray pesticides or irrigate crops today?`,
    `Are there any active cyclone or severe weather warnings?`,
    `What is the marine wave height and fishing safety status?`
  ];
}

module.exports = {
  generateConversationalResponse
};
