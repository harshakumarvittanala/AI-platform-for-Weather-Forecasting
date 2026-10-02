import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Bell, 
  Send, 
  PhoneCall, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  MapPin, 
  Radio, 
  Flame, 
  Waves, 
  Zap, 
  CloudRain 
} from 'lucide-react';
import { translations } from '../translations';
import { playEmergencySiren } from '../utils/speech';

export default function AlertsCenter({
  alertData,
  currentLanguage,
  locationName
}) {
  const t = translations[currentLanguage] || translations.en;
  
  const [activeChannel, setActiveChannel] = useState('sms');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [dispatchResult, setDispatchResult] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  const locationAlerts = alertData?.currentLocationAlerts?.alerts || [];
  const nationalAlerts = alertData?.nationalActiveAlerts || [];
  const overallSeverity = alertData?.currentLocationAlerts?.overallSeverity || 'GREEN';

  const triggerSiren = () => {
    setSirenPlaying(true);
    playEmergencySiren(4);
    setTimeout(() => {
      setSirenPlaying(false);
    }, 4000);
  };

  const handleDispatchAlert = async (alertId) => {
    setDispatching(true);
    try {
      const res = await fetch('/api/alerts/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId,
          channel: activeChannel,
          phone: phoneNumber,
          location: locationName
        })
      });
      const data = await res.json();
      if (data.success) {
        setDispatchResult(data.dispatch);
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
    } finally {
      setDispatching(false);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'RED':
        return {
          bg: 'bg-red-500 text-white',
          border: 'border-red-600',
          cardBg: 'bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-900',
          label: 'RED ALERT (TAKE ACTION)',
          icon: <ShieldAlert className="w-5 h-5 text-red-500 animate-bounce" />
        };
      case 'ORANGE':
        return {
          bg: 'bg-amber-500 text-white',
          border: 'border-amber-600',
          cardBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900',
          label: 'ORANGE ALERT (BE PREPARED)',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />
        };
      case 'YELLOW':
        return {
          bg: 'bg-yellow-500 text-slate-900 font-bold',
          border: 'border-yellow-600',
          cardBg: 'bg-yellow-50/70 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-900',
          label: 'YELLOW ALERT (BE AWARE)',
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />
        };
      default:
        return {
          bg: 'bg-emerald-500 text-white',
          border: 'border-emerald-600',
          cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900',
          label: 'GREEN ALERT (NO WARNING)',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        };
    }
  };

  const currentBadge = getSeverityBadge(overallSeverity);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* IMD Severity Status Banner */}
      <div className={`p-6 rounded-3xl border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${currentBadge.cardBg}`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-sm shrink-0">
            {currentBadge.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${currentBadge.bg}`}>
                {currentBadge.label}
              </span>
              <span className="text-xs font-medium text-slate-500">
                IMD Early Warning System
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Current Warning Status for {locationName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              {locationAlerts[0]?.description || t.noAlerts}
            </p>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={triggerSiren}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition-all ${
              sirenPlaying ? 'bg-red-600 animate-pulse' : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600'
            }`}
            title="Test Emergency Audio Siren"
          >
            <Radio className="w-4 h-4 text-red-400 animate-spin-slow" />
            <span>{sirenPlaying ? 'Siren Active...' : 'Test Alert Siren'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Active Alerts & Emergency Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Detailed Warnings for Location & Active Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>National & Regional Severe Weather Bulletins</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Source: IMD & Disaster Management Cell
            </span>
          </div>

          <div className="space-y-3">
            {nationalAlerts.map((alert) => {
              const b = getSeverityBadge(alert.severity);
              const desc = currentLanguage === 'te' 
                ? (alert.descriptionTelugu || alert.description)
                : currentLanguage === 'hi'
                ? (alert.descriptionHindi || alert.description)
                : alert.description;

              return (
                <div
                  key={alert.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${b.bg}`}>
                        {alert.severity}
                      </span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {alert.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      {alert.region}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {desc}
                  </p>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1 border border-slate-100 dark:border-slate-700">
                    <p>
                      <strong>Recommended Safety Action:</strong> {alert.recommendedAction}
                    </p>
                    <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                      Helpline: {alert.helpline}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>Districts: {alert.districts?.join(', ')}</span>
                    <button
                      onClick={() => handleDispatchAlert(alert.id)}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-600 dark:text-sky-300 font-bold transition-colors"
                    >
                      Dispatch Simulated SMS Alert
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Cyclone & Sea Surge Radar Simulation */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h4 className="font-bold text-sm tracking-wide">
                  Live Cyclone Tracking & Storm Surge Telemetry
                </h4>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
                BOB-04/DEEP-DEP
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono my-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-400 text-[10px]">Estimated Eye</p>
                <p className="font-bold text-cyan-300">17.2°N, 84.1°E</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Distance to Coast</p>
                <p className="font-bold text-amber-300">185 km ESE Vizag</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Max Sustained Wind</p>
                <p className="font-bold text-red-400">65 kmph (Gusts 75)</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">Storm Surge Est.</p>
                <p className="font-bold text-purple-300">1.2m above Tide</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              System tracking northwestward towards North Andhra Pradesh - South Odisha coast. Fishermen warning flag Stage-II hoisted at Visakhapatnam, Kakinada, and Paradeep ports.
            </p>
          </div>
        </div>

        {/* Right Col: Emergency Alert Dispatch Simulator */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between h-fit space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Emergency Alert Dispatcher
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Simulate broadcasting instant localized early warnings to rural citizens, disaster quick-response teams, and coastal panchayats.
            </p>

            {/* Channel Selector */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['sms', 'whatsapp', 'push'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`py-2 text-xs font-bold rounded-xl uppercase transition-colors ${
                    activeChannel === ch
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>

            {/* Phone Input */}
            <div className="space-y-1 mb-4">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Target Recipient / Community Group:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 Mobile number or Village Group"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono"
              />
            </div>

            <button
              onClick={() => handleDispatchAlert(nationalAlerts[0]?.id || 'ALT-IN-2026-001')}
              disabled={dispatching}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{dispatching ? 'Broadcasting Emergency Alert...' : 'Broadcast Emergency Early Warning'}</span>
            </button>
          </div>

          {/* Dispatch Outcome Preview Card */}
          {dispatchResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs animate-fade-in">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold mb-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Dispatched to Gateway ({dispatchResult.deliveryTimeMs}ms)</span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                ID: {dispatchResult.dispatchId} • Via: {dispatchResult.channel.toUpperCase()}
              </p>
              
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 text-[11px] text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-900">
                <p className="font-semibold text-emerald-600 mb-1">Transmitted Vernacular Message:</p>
                <p className="italic">
                  {currentLanguage === 'te' 
                    ? dispatchResult.payload?.telugu 
                    : currentLanguage === 'hi' 
                    ? dispatchResult.payload?.hindi 
                    : dispatchResult.payload?.english}
                </p>
              </div>
            </div>
          )}

          {/* Emergency Helpline Directory */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-red-500" />
              National Emergency Helplines
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-slate-400">NDRF Control</p>
                <p className="font-bold text-slate-800 dark:text-white">1078</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-slate-400">State Disaster</p>
                <p className="font-bold text-slate-800 dark:text-white">1070</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-slate-400">Coast Guard</p>
                <p className="font-bold text-slate-800 dark:text-white">1554</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-slate-400">Kisan Helpline</p>
                <p className="font-bold text-slate-800 dark:text-white">1800-180-1551</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
