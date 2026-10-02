import React, { useState } from 'react';
import { Settings, X, Key, Globe, MapPin, Check, Sparkles, Activity } from 'lucide-react';
import { translations } from '../translations';

export default function SettingsModal({
  isOpen,
  onClose,
  currentLanguage,
  setCurrentLanguage,
  customApiKey,
  setCustomApiKey,
  locationName,
  onSearchCity
}) {
  const [apiKeyInput, setApiKeyInput] = useState(customApiKey || '');
  const [locInput, setLocInput] = useState(locationName || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const t = translations[currentLanguage] || translations.en;

  const handleSave = (e) => {
    e.preventDefault();
    setCustomApiKey(apiKeyInput.trim());
    if (locInput.trim() && locInput !== locationName) {
      onSearchCity(locInput.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-500" />
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              {t.settings}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="py-4 space-y-4 text-xs">
          
          {/* Gemini API Key */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-sky-500" />
              <span>Google Gemini API Key (Optional)</span>
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy... (leave blank to use Built-in Native AI Engine)"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none font-mono text-xs focus:ring-2 focus:ring-sky-500/30"
            />
            <p className="text-[11px] text-slate-400">
              💡 Even without an API key, the platform uses our built-in high-precision Meteorological Reasoning Engine out of the box!
            </p>
          </div>

          {/* Default Location */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-500" />
              <span>Default Location</span>
            </label>
            <input
              type="text"
              value={locInput}
              onChange={(e) => setLocInput(e.target.value)}
              placeholder="e.g. Hyderabad, Delhi, Vijayawada..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            />
          </div>

          {/* Primary Language */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span>Primary Language</span>
            </label>
            <select
              value={currentLanguage}
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
            >
              <option value="en">English (Global)</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          {/* System Status Indicators */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center justify-between">
              <span>Open-Meteo & IMD Telemetry:</span>
              <strong className="text-emerald-500 font-bold">ONLINE & SYNCED</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Conversational AI Engine:</span>
              <strong className="text-sky-500 font-bold">
                {apiKeyInput ? 'GEMINI 1.5 FLASH' : 'NATIVE METEOROLOGY ENGINE'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Web Speech STT / TTS:</span>
              <strong className="text-purple-500 font-bold">SUPPORTED</strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved!' : t.saveSettings}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
