import React, { useState } from 'react';
import { 
  Sun, 
  SunMedium, 
  CloudSun, 
  Cloud, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Snowflake, 
  CloudFog,
  Wind, 
  Droplets, 
  Compass, 
  Eye, 
  Gauge, 
  Sunrise, 
  Sunset, 
  Calendar, 
  Clock, 
  MapPin, 
  Search, 
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity
} from 'lucide-react';
import { translations } from '../translations';

export default function WeatherDashboard({
  weatherData,
  currentLanguage,
  locationName,
  onSearchCity,
  onUseGps,
  isLoading
}) {
  const [searchInput, setSearchInput] = useState('');
  const t = translations[currentLanguage] || translations.en;

  if (isLoading || !weatherData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">
          Loading meteorological telemetry for {locationName}...
        </p>
      </div>
    );
  }

  const current = weatherData.current || {};
  const hourly = weatherData.hourly || [];
  const daily = weatherData.daily || [];
  const aqi = weatherData.airQuality || {};

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearchCity(searchInput.trim());
      setSearchInput('');
    }
  };

  const getConditionIcon = (iconName, className = "w-8 h-8") => {
    switch (iconName) {
      case 'Sun': return <Sun className={`${className} text-amber-500`} />;
      case 'SunMedium': return <SunMedium className={`${className} text-amber-400`} />;
      case 'CloudSun': return <CloudSun className={`${className} text-sky-500`} />;
      case 'Cloud': return <Cloud className={`${className} text-slate-400`} />;
      case 'CloudRain': return <CloudRain className={`${className} text-blue-500`} />;
      case 'CloudDrizzle': return <CloudDrizzle className={`${className} text-sky-400`} />;
      case 'CloudLightning': return <CloudLightning className={`${className} text-purple-500`} />;
      case 'Snowflake': return <Snowflake className={`${className} text-cyan-400`} />;
      case 'CloudFog': return <CloudFog className={`${className} text-slate-300`} />;
      default: return <CloudSun className={`${className} text-sky-500`} />;
    }
  };

  const localizedCondition = currentLanguage === 'te' 
    ? (current.conditionTelugu || current.condition)
    : currentLanguage === 'hi' 
    ? (current.conditionHindi || current.condition)
    : currentLanguage === 'ta'
    ? (current.conditionTamil || current.condition)
    : current.condition;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Search & Location Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shrink-0 transition-colors"
          >
            Search
          </button>
        </form>

        <button
          onClick={onUseGps}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-500" />
          <span>{t.useGPS}</span>
        </button>
      </div>

      {/* Hero Current Weather & Key Atmospheric Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Temperature Card */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-sky-200" />
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {weatherData.location?.name || locationName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 opacity-90">
                Coordinates: {weatherData.location?.latitude?.toFixed(2)}°N, {weatherData.location?.longitude?.toFixed(2)}°E • Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              {getConditionIcon(current.icon, "w-10 h-10")}
              <div>
                <p className="text-sm font-bold capitalize">{localizedCondition}</p>
                <p className="text-[11px] text-sky-100">
                  Day/Night: {current.isDay ? 'Daytime ☀️' : 'Nighttime 🌙'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-baseline gap-4 relative z-10">
            <div className="flex items-baseline">
              <span className="text-6xl sm:text-7xl font-black tracking-tighter">
                {current.temperature}
              </span>
              <span className="text-3xl sm:text-4xl font-light ml-1 text-sky-200">°C</span>
            </div>

            <div className="sm:ml-4 text-sm text-sky-100 space-y-0.5">
              <p>
                {t.feelsLike}: <strong className="text-white font-bold">{current.feelsLike}°C</strong>
              </p>
              <p>
                Today's Range: <strong className="text-white font-bold">{daily[0]?.tempMax || 32}°C</strong> / {daily[0]?.tempMin || 22}°C
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar inside Hero */}
          <div className="mt-8 pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 text-xs">
            <div className="flex items-center gap-2.5">
              <Droplets className="w-5 h-5 text-sky-200 shrink-0" />
              <div>
                <p className="text-sky-200 text-[11px]">{t.humidity}</p>
                <p className="text-sm font-bold">{current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Wind className="w-5 h-5 text-sky-200 shrink-0" />
              <div>
                <p className="text-sky-200 text-[11px]">{t.wind}</p>
                <p className="text-sm font-bold">{current.windSpeed} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <CloudRain className="w-5 h-5 text-sky-200 shrink-0" />
              <div>
                <p className="text-sky-200 text-[11px]">{t.rainProbability}</p>
                <p className="text-sm font-bold">{daily[0]?.rainProbability || 0}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Gauge className="w-5 h-5 text-sky-200 shrink-0" />
              <div>
                <p className="text-sky-200 text-[11px]">{t.pressure}</p>
                <p className="text-sm font-bold">{current.pressure} hPa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Air Quality Index (AQI) Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-800 dark:text-white text-base">
                  {t.airQuality}
                </h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{ backgroundColor: `${aqi.color}20`, color: aqi.color }}>
                {aqi.category}
              </span>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center font-extrabold text-2xl shadow-inner text-white" style={{ backgroundColor: aqi.color }}>
                <span>{aqi.aqi}</span>
                <span className="text-[10px] font-normal uppercase tracking-wider opacity-90">AQI</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {aqi.aqi <= 50 ? 'Air quality is satisfactory with little or no health risk.' : 
                   aqi.aqi <= 100 ? 'Acceptable air quality; sensitive people should limit prolonged outdoor exertion.' :
                   'Unhealthy air pollutants detected. Sensitive groups should wear masks.'}
                </p>
              </div>
            </div>

            {/* Pollutant Breakdown */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">PM2.5</span>
                <p className="font-bold text-slate-800 dark:text-white">{aqi.pm2_5} µg/m³</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">PM10</span>
                <p className="font-bold text-slate-800 dark:text-white">{aqi.pm10} µg/m³</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">NO₂</span>
                <p className="font-bold text-slate-800 dark:text-white">{aqi.no2} µg/m³</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-[10px] text-slate-400">Ozone (O₃)</span>
                <p className="font-bold text-slate-800 dark:text-white">{aqi.o3} µg/m³</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between text-xs text-slate-500">
            <span>UV Index: <strong className="text-slate-800 dark:text-white">{current.uvIndex} (Moderate)</strong></span>
            <span>Cloud Cover: <strong className="text-slate-800 dark:text-white">{current.cloudCover}%</strong></span>
          </div>
        </div>
      </div>

      {/* 24-Hour Hourly Forecast Slider */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {t.hourlyForecast}
            </h3>
          </div>
          <span className="text-xs text-slate-400">Next 24 Hours</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {hourly.map((hour, idx) => {
            const timeStr = hour.time ? new Date(hour.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : `${idx}:00`;
            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 min-w-[90px] shrink-0 hover:border-sky-300 dark:hover:border-sky-600 transition-colors"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {timeStr}
                </span>

                <div className="my-2">
                  {getConditionIcon(hour.icon, "w-7 h-7")}
                </div>

                <span className="text-base font-extrabold text-slate-800 dark:text-white">
                  {hour.temperature}°C
                </span>

                <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                  <Droplets className="w-3 h-3" />
                  <span>{hour.precipProbability}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-Day Extended Outlook */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">
              {t.sevenDayForecast}
            </h3>
          </div>
          <span className="text-xs text-slate-400">IMD Global Calibration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {daily.map((day, idx) => {
            const dateObj = new Date(day.date);
            const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
            const monthDay = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  idx === 0 
                    ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800' 
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-white">{dayName}</span>
                    <span className="text-[10px] text-slate-400">{monthDay}</span>
                  </div>

                  <div className="flex items-center gap-2 my-2">
                    {getConditionIcon(day.icon, "w-8 h-8")}
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                      {day.condition}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white">{day.tempMax}°C</span>
                    <span className="text-slate-400">{day.tempMin}°C</span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold">
                      <Droplets className="w-3 h-3" />
                      {day.rainProbability}%
                    </span>
                    <span>{day.rainSum} mm</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
