import React, { useState } from 'react';
import { 
  TrendingUp, 
  Thermometer, 
  CloudRain, 
  AlertTriangle, 
  ShieldCheck, 
  Map, 
  Lightbulb, 
  Activity,
  Layers
} from 'lucide-react';
import { translations } from '../translations';

export default function ClimateAnalytics({
  climateData,
  currentLanguage
}) {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const t = translations[currentLanguage] || translations.en;

  const climate = climateData?.climate || {};
  const tempTrends = climate.temperatureTrends || [];
  const rainTrends = climate.rainfallTrends || [];
  const decadalEvents = climate.extremeEventsByDecade || [];
  const zones = climate.vulnerabilityZones || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Decadal Climate Intelligence (1995 - 2026)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Long-Term Climate Trends & Vulnerability Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              High-resolution climate analytics tracking temperature rise anomalies, monsoon shifts, and agro-climatic adaptation pathways.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
            <div>
              <p className="text-[11px] text-slate-300">Warming Rate</p>
              <p className="text-xl font-black text-amber-400">
                {climate.summary?.warmingRatePerDecade || '+0.32°C / decade'}
              </p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-[11px] text-slate-300">Vulnerability Score</p>
              <p className="text-xl font-black text-rose-400">
                {climate.summary?.vulnerabilityScore || 78}/100
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSelectedMetric('temperature')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedMetric === 'temperature'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Thermometer className="w-4 h-4" />
          <span>Temperature Rise Anomalies</span>
        </button>

        <button
          onClick={() => setSelectedMetric('rainfall')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedMetric === 'rainfall'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <CloudRain className="w-4 h-4" />
          <span>Monsoon Rainfall Departures</span>
        </button>

        <button
          onClick={() => setSelectedMetric('extreme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedMetric === 'extreme'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Extreme Events Frequency</span>
        </button>
      </div>

      {/* Interactive Visualizations */}
      {selectedMetric === 'temperature' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Mean Annual Temperature Anomaly (°C Departure vs 1961-1990 Baseline)
              </h3>
              <p className="text-xs text-slate-500">
                Consistent upward warming trend observed across Indian subcontinent
              </p>
            </div>
            <span className="text-xs font-bold text-amber-500">Peak: +1.34°C in 2026</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-64 flex items-end gap-2 sm:gap-4 pt-8 px-2 border-b border-slate-200 dark:border-slate-700">
            {tempTrends.map((point) => {
              const heightPct = Math.min(100, Math.round((point.anomaly / 1.5) * 100));
              return (
                <div key={point.year} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20 shadow-md">
                    +{point.anomaly}°C (Max: {point.maxTempAvg}°C)
                  </div>

                  <div
                    className="w-full bg-gradient-to-t from-amber-400 to-rose-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold group-hover:text-amber-500">
                    '{String(point.year).slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 italic">
            * Data source: India Meteorological Department & ECMWF ERA5 Climate Reanalysis archives.
          </p>
        </div>
      )}

      {selectedMetric === 'rainfall' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Southwest Monsoon Rainfall Departure (% Deviation from 880mm LPA)
            </h3>
            <p className="text-xs text-slate-500">
              Increased inter-annual oscillation with frequent drought-flood alternating cycles
            </p>
          </div>

          <div className="h-64 flex items-center gap-2 sm:gap-4 px-2 border-y border-slate-200 dark:border-slate-700 relative">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-300 dark:bg-slate-600 border-dashed" />
            
            {rainTrends.map((point) => {
              const isPositive = point.departurePct >= 0;
              const absVal = Math.min(20, Math.abs(point.departurePct));
              const heightPx = (absVal / 20) * 110;

              return (
                <div key={point.year} className="flex-1 flex flex-col items-center justify-center relative group h-full">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg pointer-events-none whitespace-nowrap z-20">
                    {point.departurePct > 0 ? `+${point.departurePct}%` : `${point.departurePct}%`} ({point.actualMm} mm)
                  </div>

                  <div className="h-1/2 flex items-end w-full justify-center">
                    {isPositive && (
                      <div
                        className="w-full max-w-[28px] bg-sky-500 rounded-t-md transition-all"
                        style={{ height: `${heightPx}px` }}
                      />
                    )}
                  </div>
                  <div className="h-1/2 flex items-start w-full justify-center">
                    {!isPositive && (
                      <div
                        className="w-full max-w-[28px] bg-amber-500 rounded-b-md transition-all"
                        style={{ height: `${heightPx}px` }}
                      />
                    )}
                  </div>
                  <span className="absolute bottom-1 text-[10px] text-slate-500 font-semibold">
                    '{String(point.year).slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedMetric === 'extreme' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Extreme Weather Occurrence Multipliers (Decadal Shift)
            </h3>
            <p className="text-xs text-slate-500">
              Significant expansion in annual heatwave days and severe cyclonic storms
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {decadalEvents.map((decade, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700">
                <span className="font-black text-sm text-slate-900 dark:text-white">{decade.decade}</span>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heatwave Days/yr:</span>
                    <strong className="text-red-500">{decade.heatwaveDaysPerYear} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heavy Rain Days/yr:</span>
                    <strong className="text-sky-500">{decade.heavyRainDaysPerYear} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Severe Cyclones:</span>
                    <strong className="text-purple-500">{decade.severeCyclones}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drought Vulnerability:</span>
                    <strong className="text-amber-500">{decade.droughtIncidencePct}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Agro-Climatic Vulnerability Zones */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-500" />
          <span>Regional Agro-Climatic Vulnerability Matrix</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((zone, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">{zone.zone}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  zone.riskLevel === 'CRITICAL' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {zone.riskLevel} RISK
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                <strong>Primary Hazard:</strong> {zone.primaryRisk}
              </p>
              <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Recommended Adaptation:</strong> {zone.recommendedAdaptation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
