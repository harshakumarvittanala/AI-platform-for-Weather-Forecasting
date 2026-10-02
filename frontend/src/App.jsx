import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatBot from './components/ChatBot';
import WeatherDashboard from './components/WeatherDashboard';
import AlertsCenter from './components/AlertsCenter';
import DecisionSupport from './components/DecisionSupport';
import ClimateAnalytics from './components/ClimateAnalytics';
import RuralKisanView from './components/RuralKisanView';
import SettingsModal from './components/SettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [ruralMode, setRuralMode] = useState(false);
  
  const [locationName, setLocationName] = useState('Hyderabad, Telangana');
  const [coordinates, setCoordinates] = useState({ lat: 17.3850, lon: 78.4867 });

  const [weatherData, setWeatherData] = useState(null);
  const [alertData, setAlertData] = useState(null);
  const [dssData, setDssData] = useState(null);
  const [climateData, setClimateData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState('');

  // Handle Dark Mode toggle on <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load all meteorological data when coordinates or location changes
  const fetchAllData = async (lat, lon, locName) => {
    setLoading(true);
    try {
      const [weatherRes, alertsRes, dssRes, climateRes] = await Promise.allSettled([
        fetch(`/api/weather?lat=${lat}&lon=${lon}&city=${encodeURIComponent(locName)}`),
        fetch(`/api/alerts?lat=${lat}&lon=${lon}&city=${encodeURIComponent(locName)}`),
        fetch(`/api/decision-support?lat=${lat}&lon=${lon}&city=${encodeURIComponent(locName)}`),
        fetch(`/api/climate?region=${encodeURIComponent(locName)}`)
      ]);

      if (weatherRes.status === 'fulfilled') {
        const wData = await weatherRes.value.json();
        setWeatherData(wData);
      }
      if (alertsRes.status === 'fulfilled') {
        const aData = await alertsRes.value.json();
        setAlertData(aData);
      }
      if (dssRes.status === 'fulfilled') {
        const dData = await dssRes.value.json();
        setDssData(dData);
      }
      if (climateRes.status === 'fulfilled') {
        const cData = await climateRes.value.json();
        setClimateData(cData);
      }
    } catch (err) {
      console.error('Failed to load meteorological data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(coordinates.lat, coordinates.lon, locationName);
  }, [coordinates.lat, coordinates.lon]);

  // Search for an Indian or Global City
  const handleSearchCity = async (cityName) => {
    try {
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(cityName)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const best = data.results[0];
        const fullName = `${best.name}${best.admin1 ? ', ' + best.admin1 : ''}`;
        setLocationName(fullName);
        setCoordinates({ lat: best.latitude, lon: best.longitude });
      }
    } catch (err) {
      console.warn('Search failed:', err);
    }
  };

  // Browser GPS Geolocation
  const handleUseGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocationName('GPS Location');
          setCoordinates({ lat: latitude, lon: longitude });
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
        }
      );
    }
  };

  const alertSeverity = alertData?.currentLocationAlerts?.overallSeverity || 'GREEN';
  const activeAlertCount = alertData?.currentLocationAlerts?.count || 0;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      ruralMode ? 'bg-amber-50/40 text-slate-900' : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100'
    }`}>
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        ruralMode={ruralMode}
        setRuralMode={setRuralMode}
        locationName={locationName}
        onSearchCity={handleSearchCity}
        onOpenSettings={() => setSettingsOpen(true)}
        activeAlertCount={activeAlertCount}
        alertSeverity={alertSeverity}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16 lg:pb-8">
        {activeTab === 'chat' && (
          <ChatBot
            currentLanguage={currentLanguage}
            locationName={locationName}
            weatherData={weatherData}
            onNavigateToTab={setActiveTab}
            customApiKey={customApiKey}
          />
        )}

        {activeTab === 'dashboard' && (
          <WeatherDashboard
            weatherData={weatherData}
            currentLanguage={currentLanguage}
            locationName={locationName}
            onSearchCity={handleSearchCity}
            onUseGps={handleUseGps}
            isLoading={loading}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsCenter
            alertData={alertData}
            currentLanguage={currentLanguage}
            locationName={locationName}
          />
        )}

        {activeTab === 'dss' && (
          <DecisionSupport
            dssData={dssData}
            currentLanguage={currentLanguage}
            locationName={locationName}
          />
        )}

        {activeTab === 'climate' && (
          <ClimateAnalytics
            climateData={climateData}
            currentLanguage={currentLanguage}
          />
        )}

        {activeTab === 'rural' && (
          <RuralKisanView
            weatherData={weatherData}
            dssData={dssData}
            currentLanguage={currentLanguage}
            setCurrentLanguage={setCurrentLanguage}
            locationName={locationName}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentLanguage={currentLanguage}
        setCurrentLanguage={setCurrentLanguage}
        customApiKey={customApiKey}
        setCustomApiKey={setCustomApiKey}
        locationName={locationName}
        onSearchCity={handleSearchCity}
      />

      {/* Global Status Bar */}
      <footer className="hidden sm:flex border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6 py-2.5 items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <strong className="text-slate-700 dark:text-slate-300">MausamVani AI Platform v1.0</strong>
          </span>
          <span>• IMD Standard Alerts</span>
          <span>• Open-Meteo High-Resolution Grid</span>
          <span>• Multi-Domain DSS</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Multilingual: EN, HI, TE, TA</span>
          <span>Voice STT / TTS Enabled</span>
        </div>
      </footer>
    </div>
  );
}
