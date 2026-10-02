import React, { useState } from 'react';
import { 
  CloudSun, 
  MessageSquare, 
  BarChart3, 
  AlertTriangle, 
  Compass, 
  TrendingUp, 
  Sprout, 
  Settings, 
  Moon, 
  Sun, 
  MapPin, 
  Search,
  Volume2,
  VolumeX,
  Globe
} from 'lucide-react';
import { translations } from '../translations';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentLanguage,
  setCurrentLanguage,
  darkMode,
  setDarkMode,
  ruralMode,
  setRuralMode,
  locationName,
  onSearchCity,
  onOpenSettings,
  activeAlertCount = 0,
  alertSeverity = 'GREEN'
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [cityInput, setCityInput] = useState('');

  const t = translations[currentLanguage] || translations.en;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      onSearchCity(cityInput.trim());
      setSearchOpen(false);
      setCityInput('');
    }
  };

  const navItems = [
    { id: 'chat', label: t.navChat, icon: MessageSquare },
    { id: 'dashboard', label: t.navDashboard, icon: CloudSun },
    { 
      id: 'alerts', 
      label: t.navAlerts, 
      icon: AlertTriangle,
      badge: activeAlertCount > 0 ? activeAlertCount : null,
      badgeColor: alertSeverity === 'RED' ? 'bg-red-500' : (alertSeverity === 'ORANGE' ? 'bg-amber-500' : 'bg-yellow-500')
    },
    { id: 'dss', label: t.navDSS, icon: Compass },
    { id: 'climate', label: t.navClimate, icon: TrendingUp },
    { id: 'rural', label: t.navRural, icon: Sprout, highlight: true }
  ];

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <CloudSun className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-300 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                IMD & Open-Meteo Synced
              </p>
            </div>
          </div>

          {/* Location Badge & Search */}
          <div className="flex items-center gap-2">
            {!searchOpen ? (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/60 dark:border-slate-700"
                title="Change Location"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                <span className="max-w-[120px] sm:max-w-[160px] truncate">{locationName}</span>
                <Search className="w-3 h-3 text-slate-400 ml-1" />
              </button>
            ) : (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="City or district..."
                  autoFocus
                  className="px-2.5 py-1 text-xs rounded-lg border border-sky-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none w-32 sm:w-48 shadow-sm"
                />
                <button
                  type="submit"
                  className="px-2 py-1 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </form>
            )}
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 shadow-sm border border-sky-200/50 dark:border-sky-800/50'
                      : item.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-300' : (item.highlight ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400')}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] text-white font-bold rounded-full ${item.badgeColor} animate-pulse`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Utility Controls */}
          <div className="flex items-center gap-2">
            
            {/* Language Dropdown */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 border border-slate-200 dark:border-slate-700 outline-none cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Select Language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Settings & API Keys"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Strip */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-2 bg-white dark:bg-slate-900 px-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive
                  ? 'text-sky-600 dark:text-sky-300 font-bold'
                  : item.highlight
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[64px]">{item.label}</span>
              {item.badge && (
                <span className={`absolute top-0 right-1 w-2 h-2 rounded-full ${item.badgeColor}`} />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
