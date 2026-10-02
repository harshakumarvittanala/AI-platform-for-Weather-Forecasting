/**
 * Multi-Domain Decision Support System (DSS) Service
 * Specialized intelligence for Agriculture, Marine, Aviation, Disaster Management, and Public Health
 */

function generateDecisionSupport(weatherData, locationName = 'Your Area') {
  const current = weatherData.current || {};
  const daily = weatherData.daily || [];
  const hourly = weatherData.hourly || [];
  const aqi = weatherData.airQuality || {};

  const temp = current.temperature ?? 28;
  const humidity = current.humidity ?? 65;
  const windSpeed = current.windSpeed ?? 14; // km/h
  const windGusts = current.windGusts ?? 20;
  const rainToday = daily[0]?.rainSum ?? 0;
  const rainProb = daily[0]?.rainProbability ?? 15;
  const rainNext48h = (daily[0]?.rainSum ?? 0) + (daily[1]?.rainSum ?? 0);
  const rainProb48h = Math.max(daily[0]?.rainProbability ?? 0, daily[1]?.rainProbability ?? 0);

  // ----------------------------------------------------
  // 1. AGRICULTURE & FARMING (Kisan Advisory)
  // ----------------------------------------------------
  let irrigationAdvice = {
    status: 'OPTIMAL',
    recommendation: 'Normal light irrigation recommended.',
    recommendationTelugu: 'సాధారణ తేలికపాటి తడి అందించవచ్చు.',
    recommendationHindi: 'सामान्य हल्की सिंचाई की सलाह दी जाती है।',
    icon: 'Droplets',
    color: 'emerald'
  };

  if (rainNext48h > 15 || rainProb48h > 65) {
    irrigationAdvice = {
      status: 'POSTPONE',
      recommendation: `Heavy/moderate rain (${rainNext48h.toFixed(1)}mm) expected within 48h. Postpone irrigation to prevent root rot and save groundwater!`,
      recommendationTelugu: `రాబోయే 48 గంటల్లో వర్షం (${rainNext48h.toFixed(1)}mm) పడే అవకాశం ఉంది. నీటిపారుదల వాయిదా వేయండి, పైరుకు మేలు జరుగుతుంది.`,
      recommendationHindi: `अगले 48 घंटों में बारिश (${rainNext48h.toFixed(1)} मिमी) की संभावना है। जलभराव व जड़ गलन से बचने के लिए सिंचाई रोकें।`,
      icon: 'AlertTriangle',
      color: 'amber'
    };
  } else if (temp > 38 && humidity < 40) {
    irrigationAdvice = {
      status: 'URGENT',
      recommendation: 'High evaporative loss due to heat. Apply critical evening drip/sprinkler irrigation.',
      recommendationTelugu: 'ఎండ తీవ్రత వల్ల నేలలో తేమ తగ్గింది. సాయంత్రం వేళల్లో డ్రిప్ ద్వారా తడి అందించండి.',
      recommendationHindi: 'तीव्र धूप के कारण नमी कम हो रही है। शाम के समय हल्की सिंचाई अवश्य करें।',
      icon: 'Flame',
      color: 'red'
    };
  }

  // Pesticide / Fertilizer Spraying
  let sprayAdvice = {
    isSafe: true,
    recommendation: 'Ideal conditions for foliar spray and fertilizer application.',
    recommendationTelugu: 'మందులు మరియు ఎరువులు చల్లుటకు వాతావరణం చాలా అనుకూలంగా ఉంది.',
    recommendationHindi: 'कीटनाशक व खाद छिड़काव के लिए मौसम सर्वथा अनुकूल है।',
    riskLevel: 'LOW'
  };

  if (windSpeed > 15 || windGusts > 25) {
    sprayAdvice = {
      isSafe: false,
      recommendation: `High winds (${windSpeed} km/h, gusts ${windGusts} km/h) will cause spray drift and wasted chemical. Do not spray today.`,
      recommendationTelugu: `ఈదురు గాలులు (${windSpeed} కి.మీ/గం) వీస్తున్నందున మందుల పిచికారీ చేయవద్దు. మందు వృధా అవుతుంది.`,
      recommendationHindi: `तेज़ हवाओं (${windSpeed} किमी/घंटा) के कारण दवा का बहाव होगा। आज छिड़काव न करें।`,
      riskLevel: 'HIGH'
    };
  } else if (rainProb > 40 || rainToday > 1) {
    sprayAdvice = {
      isSafe: false,
      recommendation: 'Rain imminent. Pesticide will wash off before systemic absorption. Postpone by 24 hours.',
      recommendationTelugu: 'వర్షం పడే అవకాశం ఉన్నందున మందు కడిగిపోతుంది. పిచికారీని 24 గంటలు వాయిదా వేయండి.',
      recommendationHindi: 'बारिश की संभावना के कारण दवा धुल जाएगी। छिड़काव स्थगित करें।',
      riskLevel: 'HIGH'
    };
  }

  // Crop-Specific Insights
  const cropTips = [
    {
      crop: 'Paddy / Rice (వరి / धान)',
      stage: 'Tillering & Vegetative',
      advisory: rainNext48h > 20 
        ? 'Maintain proper drainage channels in bunds to drain excess rain water quickly.'
        : 'Maintain 3-5 cm shallow standing water layer in fields.',
      advisoryTelugu: rainNext48h > 20 
        ? 'అదనపు వర్షపు నీరు బయటకు పోయేందుకు గట్ల వద్ద మురుగు కాలువలు తెరవండి.' 
        : 'పొలంలో 3 నుండి 5 సెం.మీ మేర పలుచటి నీటి నిల్వ ఉంచండి.'
    },
    {
      crop: 'Cotton (ప్రత్తి / कपास)',
      stage: 'Flowering & Boll formation',
      advisory: humidity > 80 
        ? 'High moisture may induce whitefly / sucking pest incidence. Scout underside of leaves.'
        : 'Favorable condition. Continue soil aeration through inter-cultivation.',
      advisoryTelugu: humidity > 80 
        ? 'గాలిలో తేమ ఎక్కువగా ఉన్నందున తెల్లదోమ, పచ్చదోమ ఉధృతి పెరిగే అవకాశం ఉంది. పైరును పరిశీలించండి.'
        : 'ప్రత్తి చేలో అంతర కృషి చేసి నేల వదులుగా ఉండేలా చూసుకోండి.'
    },
    {
      crop: 'Chilli & Vegetables (మిరప / मिर्च)',
      stage: 'Fruit development',
      advisory: temp > 35
        ? 'Provide shade or mulching to conserve root zone soil moisture.'
        : 'Inspect for dieback and fungal spots if cloud cover persists.',
      advisoryTelugu: 'మేఘావృతమైన వాతావరణంలో బూడిద తెగులు లేదా కొమ్మ ఎండు తెగులు రాకుండా తగిన జాగ్రత్తలు తీసుకోండి.'
    }
  ];

  // ----------------------------------------------------
  // 2. MARINE & FISHERIES (Sagar Mitra)
  // ----------------------------------------------------
  const windKnots = Math.round(windSpeed * 0.539957);
  let waveHeightMeters = 0.8 + (windSpeed / 30);
  let seaState = 'Calm to Slight';
  let fishingSafety = 'SAFE';
  let seaAdvisory = 'Normal sailing conditions for mechanized boats and traditional country crafts.';
  let seaAdvisoryTelugu = 'సముద్రంలో చేపల వేటకు వాతావరణం అనుకూలంగా ఉంది. చిన్న పడవలు సురక్షితంగా వెళ్లవచ్చు.';
  let seaAdvisoryHindi = 'मछुआरों के लिए समुद्र में जाना सुरक्षित है। लहरों की ऊंचाई सामान्य है।';

  if (windSpeed > 45 || waveHeightMeters > 3.0) {
    seaState = 'Very Rough to High';
    fishingSafety = 'PROHIBITED';
    seaAdvisory = 'TOTAL BAN on venturing into deep sea. Dangerous swell waves and storm surge up to 3.5m.';
    seaAdvisoryTelugu = 'సముద్రంలో వేటపై పూర్తి నిషేధం! అలల ఎత్తు 3.5 మీటర్ల వరకు పెరిగే ప్రమాదం ఉంది.';
    seaAdvisoryHindi = 'समुद्र में जाने पर पूर्ण प्रतिबंध! ऊंची लहरें और चक्रवाती तूफान का गंभीर ख़तरा।';
  } else if (windSpeed > 28 || waveHeightMeters > 1.8) {
    seaState = 'Moderate to Rough';
    fishingSafety = 'CAUTION';
    seaAdvisory = 'Fishermen advised not to venture beyond 15 nautical miles. Small catamarans should stay near shore.';
    seaAdvisoryTelugu = 'మత్స్యకారులు తీరం దాటి లోతైన సముద్రంలోకి వెళ్లరాదు. జాగ్రత్తలు పాటించండి.';
    seaAdvisoryHindi = 'मछुआरों को गहरे समुद्र में न जाने और तट के करीब रहने की सलाह।';
  }

  // ----------------------------------------------------
  // 3. AVIATION & LOGISTICS (Viman Alert)
  // ----------------------------------------------------
  const visibilityKm = hourly[0]?.visibility ?? (humidity > 90 ? 4 : 10);
  let flightRisk = 'LOW';
  let aviationNote = 'Unrestricted visual flight rules (VFR). Calm wind vectors on primary runways.';

  if (visibilityKm < 1.5 || windGusts > 45) {
    flightRisk = 'HIGH';
    aviationNote = `Reduced visibility (${visibilityKm} km) and severe crosswind gusts (${windGusts} km/h). Instrument Landing System (ILS Cat-II/III) procedures active.`;
  } else if (visibilityKm < 4 || windSpeed > 25) {
    flightRisk = 'MODERATE';
    aviationNote = 'Minor approach turbulence and haze aloft. Expect vector delays during peak traffic.';
  }

  // ----------------------------------------------------
  // 4. DISASTER MANAGEMENT (Aapda Prabandhan)
  // ----------------------------------------------------
  let floodInundationRisk = 'LOW';
  let cycloneThreatScore = 2; // out of 10
  let evacuationChecklist = 'Normal monitoring. Keep battery banks charged.';

  if (rainNext48h > 100 || windGusts > 60) {
    floodInundationRisk = 'SEVERE';
    cycloneThreatScore = 9;
    evacuationChecklist = 'IMMEDIATE EVACUATION PROTOCOL: Activate Cyclone Shelters, mobilize SDRF teams, position dewatering pump sets.';
  } else if (rainNext48h > 50 || windSpeed > 35) {
    floodInundationRisk = 'MODERATE';
    cycloneThreatScore = 6;
    evacuationChecklist = 'Pre-position relief packets. Alert low-lying settlement panchayats. Keep 1070 helpline active.';
  }

  // ----------------------------------------------------
  // 5. URBAN PLANNING & PUBLIC HEALTH
  // ----------------------------------------------------
  // Heat Index approximation
  const heatIndex = Math.round(temp + (0.5555 * ((6.11 * Math.exp(5417.7530 * ((1/273.16) - (1/(273.15 + temp)))) * (humidity/100)) - 10)));
  let heatHealthRisk = 'LOW';
  if (heatIndex > 42) heatHealthRisk = 'EXTREME DANGER (Heat Stroke)';
  else if (heatIndex > 38) heatHealthRisk = 'HIGH DANGER (Heat Exhaustion)';
  else if (heatIndex > 32) heatHealthRisk = 'CAUTION (Fatigue Likely)';

  return {
    location: locationName,
    computedAt: new Date().toISOString(),
    agriculture: {
      soilMoistureEstimate: `${Math.round(40 + (rainToday * 2) - (temp * 0.3))}%`,
      evapotranspiration: `${(temp * 0.15).toFixed(1)} mm/day`,
      irrigation: irrigationAdvice,
      spraying: sprayAdvice,
      crops: cropTips
    },
    marine: {
      seaState,
      fishingSafety,
      waveHeight: `${waveHeightMeters.toFixed(1)} m`,
      windKnots: `${windKnots} kts (${windSpeed} km/h)`,
      advisory: seaAdvisory,
      advisoryTelugu: seaAdvisoryTelugu,
      advisoryHindi: seaAdvisoryHindi,
      harborSignal: windSpeed > 40 ? 'Signal No. 3 (Local Caution)' : 'Signal No. 1 (Normal)'
    },
    aviation: {
      flightRisk,
      visibility: `${visibilityKm} km`,
      cloudCeiling: humidity > 85 ? '1,500 ft (Scattered)' : '8,000 ft (Broken/Clear)',
      crosswindComponent: `${Math.round(windSpeed * 0.7)} km/h`,
      advisory: aviationNote
    },
    disasterManagement: {
      hazardLevel: cycloneThreatScore > 7 ? 'CRITICAL' : (cycloneThreatScore > 4 ? 'ELEVATED' : 'STANDBY'),
      cycloneThreatScore,
      floodRisk: floodInundationRisk,
      actionPlan: evacuationChecklist,
      emergencyContacts: [
        { agency: 'National Disaster Response Force (NDRF)', contact: '1078 / 011-24363260' },
        { agency: 'State Disaster Management Control Room', contact: '1070' },
        { agency: 'Coast Guard Rescue Coordination (MRCC)', contact: '1554' },
        { agency: 'Kisan Emergency Call Center', contact: '1800-180-1551' },
        { agency: 'Ambulance & Medical Emergency', contact: '108' }
      ]
    },
    publicHealth: {
      heatIndex: `${heatIndex}°C`,
      heatHealthRisk,
      aqiImpact: aqi.category || 'Moderate',
      outdoorWorkAdvice: heatIndex > 38 
        ? 'Prohibit heavy outdoor construction work between 12 PM - 3:30 PM.' 
        : 'Normal outdoor activities permitted with standard hydration.'
    }
  };
}

module.exports = {
  generateDecisionSupport
};
