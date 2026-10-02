import React, { useState } from 'react';
import { 
  Sprout, 
  Waves, 
  Plane, 
  ShieldAlert, 
  HeartPulse, 
  Droplets, 
  Wind, 
  Sun, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Thermometer, 
  Building2, 
  PhoneCall,
  Info
} from 'lucide-react';
import { translations } from '../translations';

export default function DecisionSupport({
  dssData,
  currentLanguage,
  locationName
}) {
  const [activeDomain, setActiveDomain] = useState('agriculture');
  const t = translations[currentLanguage] || translations.en;

  const dss = dssData?.dss || {};
  const agri = dss.agriculture || {};
  const marine = dss.marine || {};
  const aviation = dss.aviation || {};
  const disaster = dss.disasterManagement || {};
  const health = dss.publicHealth || {};

  const domains = [
    { id: 'agriculture', label: t.agricultureTab, icon: Sprout, color: 'text-emerald-500' },
    { id: 'marine', label: t.marineTab, icon: Waves, color: 'text-blue-500' },
    { id: 'aviation', label: t.aviationTab, icon: Plane, color: 'text-sky-500' },
    { id: 'disaster', label: t.disasterTab, icon: ShieldAlert, color: 'text-red-500' },
    { id: 'health', label: t.healthTab, icon: HeartPulse, color: 'text-rose-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Domain Header & Selector Pills */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Multi-Domain Meteorological Decision Support</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational recommendations tailored for farmers, marine sailors, pilots, and disaster teams in {locationName}
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {domains.map((d) => {
            const Icon = d.icon;
            const isActive = activeDomain === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setActiveDomain(d.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : d.color}`} />
                <span>{d.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. AGRICULTURE DOMAIN (Kisan Mitra) */}
      {activeDomain === 'agriculture' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Irrigation Advisory Card */}
            <div className={`p-6 rounded-3xl border shadow-sm ${
              agri.irrigation?.status === 'POSTPONE'
                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900'
                : agri.irrigation?.status === 'URGENT'
                ? 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-900'
                : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.irrigationAdvice}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  agri.irrigation?.status === 'POSTPONE' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {agri.irrigation?.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {currentLanguage === 'te' 
                  ? agri.irrigation?.recommendationTelugu 
                  : currentLanguage === 'hi' 
                  ? agri.irrigation?.recommendationHindi 
                  : agri.irrigation?.recommendation}
              </h3>
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Soil Moisture Est: <strong className="text-slate-900 dark:text-white">{agri.soilMoistureEstimate}</strong></span>
                <span>Evapotranspiration: <strong className="text-slate-900 dark:text-white">{agri.evapotranspiration}</strong></span>
              </div>
            </div>

            {/* Chemical & Spray Feasibility */}
            <div className={`p-6 rounded-3xl border shadow-sm ${
              agri.spraying?.isSafe 
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900'
                : 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-900'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.sprayAdvice}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  agri.spraying?.isSafe ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {agri.spraying?.isSafe ? 'PERMITTED' : 'NOT RECOMMENDED'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {currentLanguage === 'te' 
                  ? agri.spraying?.recommendationTelugu 
                  : currentLanguage === 'hi' 
                  ? agri.spraying?.recommendationHindi 
                  : agri.spraying?.recommendation}
              </h3>
              <p className="text-xs text-slate-500 mt-2">
                Drift Risk: <strong>{agri.spraying?.riskLevel}</strong> • High wind speed or imminent rain can wash away foliar applications, wasting inputs.
              </p>
            </div>
          </div>

          {/* Crop Specific Intelligence */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-4">
              Regional Crop Management Guidelines (Fasli Salah)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {agri.crops?.map((crop, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{crop.crop}</h4>
                    <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      {crop.stage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentLanguage === 'te' ? (crop.advisoryTelugu || crop.advisory) : crop.advisory}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MARINE & FISHERIES DOMAIN (Sagar Mitra) */}
      {activeDomain === 'marine' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Fishermen Sea Venturing Status */}
            <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.seaVenturing}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  marine.fishingSafety === 'SAFE' 
                    ? 'bg-emerald-500 text-white' 
                    : marine.fishingSafety === 'CAUTION'
                    ? 'bg-amber-500 text-white'
                    : 'bg-red-600 text-white animate-pulse'
                }`}>
                  {marine.fishingSafety}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {currentLanguage === 'te' ? marine.advisoryTelugu : currentLanguage === 'hi' ? marine.advisoryHindi : marine.advisory}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                INCOIS Coastal Ocean Telemetry & Coastal Warning Directive. Traditional small crafts and mechanized trawlers must adhere to offshore distance limits.
              </p>
            </div>

            {/* Sea State Parameters */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-700 text-white shadow-md flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-blue-200 mb-2">
                  Sea Conditions
                </h4>
                <p className="text-3xl font-black">{marine.waveHeight}</p>
                <p className="text-xs text-blue-100">Estimated Swell Wave Height</p>
              </div>

              <div className="pt-4 border-t border-white/20 text-xs space-y-1">
                <p>Sea State: <strong className="text-white">{marine.seaState}</strong></p>
                <p>Surface Wind: <strong className="text-white">{marine.windKnots}</strong></p>
                <p>Harbor Signal: <strong className="text-white">{marine.harborSignal}</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AVIATION & LOGISTICS DOMAIN */}
      {activeDomain === 'aviation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-400 font-semibold mb-1">Flight Operation Risk</p>
              <p className={`text-xl font-black ${
                aviation.flightRisk === 'LOW' ? 'text-emerald-500' : 'text-amber-500'
              }`}>
                {aviation.flightRisk} RISK
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-400 font-semibold mb-1">Runway Visibility (RVR)</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {aviation.visibility}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-400 font-semibold mb-1">Cloud Ceiling</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {aviation.cloudCeiling}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-400 font-semibold mb-1">Crosswind Shear</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">
                {aviation.crosswindComponent}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2">
              METAR & TAF Aerodrome Weather Assessment
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {aviation.advisory}
            </p>
          </div>
        </div>
      )}

      {/* 4. DISASTER MANAGEMENT DOMAIN */}
      {activeDomain === 'disaster' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Disaster Preparedness & Inundation Risk Level
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated against flood vulnerability thresholds and cyclone tracks
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                Threat Score: {disaster.cycloneThreatScore} / 10
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 mb-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Standard Operating Protocol:
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {disaster.actionPlan}
              </p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Connect Emergency Relief Contacts:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {disaster.emergencyContacts?.map((c, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <p className="text-slate-500 dark:text-slate-400 text-[10px]">{c.agency}</p>
                  <p className="font-bold text-sky-600 dark:text-sky-400">{c.contact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. PUBLIC HEALTH & URBAN PLANNING */}
      {activeDomain === 'health' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-500 mb-2">Thermal Distress & Heat Index</h4>
              <p className="text-4xl font-black text-amber-500 mb-1">{health.heatIndex}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Classification: {health.heatHealthRisk}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {health.outdoorWorkAdvice}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="font-bold text-sm text-slate-500 mb-2">Urban Infrastructure Alert</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                Urban stormwater drainage load status: <strong>NORMAL TO MODERATE</strong>. Low-lying railway underpasses and roadside culverts clear for traffic flow.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Air pollution health advisory: Keep windows closed during early morning temperature inversion if PM2.5 exceeds 60 µg/m³.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
