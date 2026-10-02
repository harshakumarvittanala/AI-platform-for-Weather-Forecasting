/**
 * Climate Analytics & Historical Intelligence Service
 * Analyzes multi-decadal trends (1995 - 2026), temperature anomalies, monsoon variability, and climate vulnerability
 */

function getClimateAnalytics(region = 'India National') {
  // 30-Year Decadal Temperature Anomaly data (°C vs 1961-1990 baseline)
  const temperatureTrends = [
    { year: 1995, anomaly: +0.22, maxTempAvg: 30.8, minTempAvg: 19.1 },
    { year: 1998, anomaly: +0.48, maxTempAvg: 31.4, minTempAvg: 19.6 },
    { year: 2001, anomaly: +0.31, maxTempAvg: 31.0, minTempAvg: 19.3 },
    { year: 2005, anomaly: +0.52, maxTempAvg: 31.5, minTempAvg: 19.7 },
    { year: 2009, anomaly: +0.71, maxTempAvg: 31.8, minTempAvg: 20.0 },
    { year: 2012, anomaly: +0.64, maxTempAvg: 31.7, minTempAvg: 19.9 },
    { year: 2016, anomaly: +0.94, maxTempAvg: 32.2, minTempAvg: 20.4 },
    { year: 2019, anomaly: +0.88, maxTempAvg: 32.0, minTempAvg: 20.3 },
    { year: 2022, anomaly: +1.08, maxTempAvg: 32.4, minTempAvg: 20.6 },
    { year: 2024, anomaly: +1.21, maxTempAvg: 32.6, minTempAvg: 20.8 },
    { year: 2025, anomaly: +1.29, maxTempAvg: 32.8, minTempAvg: 20.9 },
    { year: 2026, anomaly: +1.34, maxTempAvg: 32.9, minTempAvg: 21.0 }
  ];

  // Monsoon Rainfall Departure (% from Long Period Average 880mm)
  const rainfallTrends = [
    { year: 2015, departurePct: -14.2, actualMm: 760, category: 'Deficient' },
    { year: 2016, departurePct: -3.1, actualMm: 852, category: 'Normal' },
    { year: 2017, departurePct: -5.4, actualMm: 841, category: 'Normal' },
    { year: 2018, departurePct: -9.1, actualMm: 804, category: 'Below Normal' },
    { year: 2019, departurePct: +10.2, actualMm: 968, category: 'Above Normal' },
    { year: 2020, departurePct: +8.8, actualMm: 958, category: 'Above Normal' },
    { year: 2021, departurePct: -0.7, actualMm: 874, category: 'Normal' },
    { year: 2022, departurePct: +6.5, actualMm: 925, category: 'Above Normal' },
    { year: 2023, departurePct: -5.6, actualMm: 820, category: 'Below Normal' },
    { year: 2024, departurePct: +7.6, actualMm: 934, category: 'Above Normal' },
    { year: 2025, departurePct: +4.2, actualMm: 906, category: 'Normal' },
    { year: 2026, departurePct: +5.8, actualMm: 920, category: 'Normal' }
  ];

  // Extreme Weather Events Frequency (Per Decade Comparison)
  const extremeEventsByDecade = [
    {
      decade: '1990 - 1999',
      heatwaveDaysPerYear: 9.4,
      heavyRainDaysPerYear: 14.1,
      severeCyclones: 12,
      droughtIncidencePct: 22
    },
    {
      decade: '2000 - 2009',
      heatwaveDaysPerYear: 14.2,
      heavyRainDaysPerYear: 18.6,
      severeCyclones: 16,
      droughtIncidencePct: 28
    },
    {
      decade: '2010 - 2019',
      heatwaveDaysPerYear: 22.8,
      heavyRainDaysPerYear: 26.4,
      severeCyclones: 21,
      droughtIncidencePct: 31
    },
    {
      decade: '2020 - 2026 (Projected)',
      heatwaveDaysPerYear: 29.5,
      heavyRainDaysPerYear: 34.2,
      severeCyclones: 27,
      droughtIncidencePct: 36
    }
  ];

  // Agro-Climatic Vulnerability Rankings
  const vulnerabilityZones = [
    {
      zone: 'Semi-Arid Deccan & Marathwada',
      riskLevel: 'VERY HIGH',
      primaryRisk: 'Chronic groundwater depletion, high heat stress, erratic dry spells.',
      recommendedAdaptation: 'Micro-irrigation subsidy, drought-resistant millets (Bajra, Jowar), farm ponds.'
    },
    {
      zone: 'East Coast (Andhra, Odisha, Bengal)',
      riskLevel: 'CRITICAL',
      primaryRisk: 'Intensifying Bay of Bengal post-monsoon cyclonic surges and coastal salinity ingress.',
      recommendedAdaptation: 'Bio-shield mangrove restoration, saline-tolerant rice varieties, underground power cabling.'
    },
    {
      zone: 'Indo-Gangetic Plains (Punjab, Haryana, UP, Bihar)',
      riskLevel: 'HIGH',
      primaryRisk: 'Shortened winter crop cycle for wheat (terminal heat), post-monsoon smog & AQI spikes.',
      recommendedAdaptation: 'Zero-tillage sowing, climate-resilient wheat (HD-3385), diversified agroforestry.'
    },
    {
      zone: 'Western Ghats & Coastal Malabar',
      riskLevel: 'HIGH',
      primaryRisk: 'Hyper-localized extreme cloudburst episodes triggering slope failures and landslides.',
      recommendedAdaptation: 'Rainfall threshold slope telemetry, watershed vegetative stabilization, early warning sirens.'
    }
  ];

  return {
    region,
    generatedAt: new Date().toISOString(),
    summary: {
      warmingRatePerDecade: '+0.32°C / decade',
      monsoonShifts: 'Increased inter-seasonal variability; longer dry spells punctuated by short-duration hyper-intense cloudbursts.',
      vulnerabilityScore: 78, // out of 100
      carbonSinkCapacity: 'Moderate (Declining forest density in semi-arid zones)'
    },
    temperatureTrends,
    rainfallTrends,
    extremeEventsByDecade,
    vulnerabilityZones,
    insights: [
      'Over the past 30 years, mean maximum temperatures across India have risen by +1.12°C, with the sharpest increase recorded during pre-monsoon March-May.',
      'Monsoon onset dates have shown a 4 to 7-day eastward delay, with high-intensity rainfall concentrated in shorter temporal windows.',
      'Heatwave days in central and peninsular India have expanded from an average of 9 days/year in 1995 to over 29 days/year in 2026.',
      'Climate smart agriculture and precision weather advisory can mitigate up to 34% of seasonal yield volatility for smallholder farmers.'
    ]
  };
}

module.exports = {
  getClimateAnalytics
};
