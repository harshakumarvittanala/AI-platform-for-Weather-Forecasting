import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Droplets, 
  Sprout, 
  Waves, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneCall,
  Sparkles
} from 'lucide-react';
import { createSpeechRecognizer, speakText, stopSpeaking } from '../utils/speech';

export default function RuralKisanView({
  weatherData,
  dssData,
  currentLanguage,
  setCurrentLanguage,
  locationName
}) {
  const [isListening, setIsListening] = useState(false);
  const [spokenResponse, setSpokenResponse] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');

  const current = weatherData?.current || {};
  const daily = weatherData?.daily || [];
  const agri = dssData?.dss?.agriculture || {};
  const marine = dssData?.dss?.marine || {};

  const handleSpeakQuery = (questionText, answerText) => {
    setActiveQuery(questionText);
    setSpokenResponse(answerText);
    stopSpeaking();
    setSpeaking(true);
    speakText(answerText, currentLanguage, () => {
      setSpeaking(false);
    });
  };

  const toggleMic = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      currentLanguage,
      async (result) => {
        if (result.final) {
          setIsListening(false);
          setActiveQuery(result.final);
          // Query backend
          try {
            const res = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: result.final,
                language: currentLanguage
              })
            });
            const data = await res.json();
            if (data.success) {
              setSpokenResponse(data.response);
              setSpeaking(true);
              speakText(data.response, currentLanguage, () => {
                setSpeaking(false);
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (recognizer) {
      recognizer.start();
      setIsListening(true);
    }
  };

  // Quick Action Buttons based on language
  const actions = currentLanguage === 'te' ? [
    {
      title: 'నేడు వర్షం పడుతుందా?',
      icon: <CloudRain className="w-8 h-8 text-sky-600" />,
      answer: `ఈరోజు ${locationName} లో వర్షం పడే అవకాశం ${daily[0]?.rainProbability || 10} శాతం ఉంది. గరిష్ట ఉష్ణోగ్రత ${daily[0]?.tempMax || 32} డిగ్రీలు. వాతావరణం: ${current.conditionTelugu || current.condition}.`
    },
    {
      title: 'పంటకు నీరు పెట్టవచ్చా?',
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      answer: agri.irrigation?.recommendationTelugu || 'సాధారణ తడి అందించవచ్చు.'
    },
    {
      title: 'మందులు / ఎరువులు చల్లవచ్చా?',
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      answer: agri.spraying?.recommendationTelugu || 'వాతావరణం అనుకూలంగా ఉంది.'
    },
    {
      title: 'చేపల వేటకు వెళ్లవచ్చా?',
      icon: <Waves className="w-8 h-8 text-indigo-600" />,
      answer: marine.advisoryTelugu || 'సముద్రంలో అలలు సాధారణంగా ఉన్నాయి.'
    }
  ] : currentLanguage === 'hi' ? [
    {
      title: 'क्या आज बारिश होगी?',
      icon: <CloudRain className="w-8 h-8 text-sky-600" />,
      answer: `आज ${locationName} में बारिश की संभावना ${daily[0]?.rainProbability || 10}% है। अधिकतम तापमान ${daily[0]?.tempMax || 32}°C रहेगा।`
    },
    {
      title: 'क्या फसलों की सिंचाई करें?',
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      answer: agri.irrigation?.recommendationHindi || 'हल्की सिंचाई की जा सकती है।'
    },
    {
      title: 'क्या कीटनाशक का छिड़काव करें?',
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      answer: agri.spraying?.recommendationHindi || 'मौसम छिड़काव के लिए अनुकूल है।'
    },
    {
      title: 'मछुआरों के लिए क्या सलाह है?',
      icon: <Waves className="w-8 h-8 text-indigo-600" />,
      answer: marine.advisoryHindi || 'समुद्र में स्थिति सामान्य है।'
    }
  ] : [
    {
      title: 'Will it rain today?',
      icon: <CloudRain className="w-8 h-8 text-sky-600" />,
      answer: `There is a ${daily[0]?.rainProbability || 15}% probability of rain in ${locationName} today. Max temperature ${daily[0]?.tempMax || 32}°C.`
    },
    {
      title: 'Should I irrigate my field?',
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      answer: agri.irrigation?.recommendation || 'Normal irrigation recommended.'
    },
    {
      title: 'Is it safe to spray pesticides?',
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      answer: agri.spraying?.recommendation || 'Conditions are safe for spraying.'
    },
    {
      title: 'Can fishermen venture into sea?',
      icon: <Waves className="w-8 h-8 text-indigo-600" />,
      answer: marine.advisory || 'Safe for sailing near coastal waters.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      
      {/* High Contrast Rural Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider">
            {currentLanguage === 'te' ? 'రైతు మిత్ర వాయిస్ వేదిక' : currentLanguage === 'hi' ? 'किसान वाणी मंच' : 'Kisan Voice Mode'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            {currentLanguage === 'te' ? 'సరళ గ్రామీణ వాతావరణం' : currentLanguage === 'hi' ? 'सरल ग्रामीण मौसम सहायता' : 'Rural-First Voice Assistant'}
          </h1>
          <p className="text-sm text-emerald-100 font-medium mt-1">
            📍 {locationName} • {current.temperature}°C • {current.condition}
          </p>
        </div>

        {/* Language selector for rural users */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
          <button
            onClick={() => setCurrentLanguage('te')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentLanguage === 'te' ? 'bg-white text-emerald-900 shadow' : 'text-white'}`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setCurrentLanguage('hi')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentLanguage === 'hi' ? 'bg-white text-emerald-900 shadow' : 'text-white'}`}
          >
            हिन्दी
          </button>
          <button
            onClick={() => setCurrentLanguage('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${currentLanguage === 'en' ? 'bg-white text-emerald-900 shadow' : 'text-white'}`}
          >
            English
          </button>
        </div>
      </div>

      {/* Giant Voice Assistant Button */}
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-400/50 dark:border-emerald-600/40 shadow-lg text-center space-y-4">
        <button
          onClick={toggleMic}
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white font-black shadow-2xl transition-all transform active:scale-95 ${
            isListening
              ? 'bg-red-500 shadow-red-500/50 animate-pulse'
              : 'bg-gradient-to-tr from-emerald-500 via-green-600 to-teal-600 shadow-emerald-500/40 hover:scale-105'
          }`}
          title="Click and Speak your question"
        >
          {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
          <span className="text-xs uppercase tracking-wider mt-1 font-bold">
            {isListening ? 'వింటున్నాము...' : (currentLanguage === 'te' ? 'మాట్లాడండి' : currentLanguage === 'hi' ? 'बोलिए' : 'Speak')}
          </span>
        </button>

        <div>
          <h3 className="font-extrabold text-lg sm:text-xl text-slate-800 dark:text-white">
            {isListening
              ? (currentLanguage === 'te' ? 'మీ ప్రశ్నను చెప్పండి...' : currentLanguage === 'hi' ? 'कृपया अपना प्रश्न पूछिए...' : 'Listening to your voice...')
              : (currentLanguage === 'te' ? 'మైక్ నొక్కి మీ ప్రశ్నను నోటితో అడగండి' : currentLanguage === 'hi' ? 'माइक दबाकर बोलें' : 'Tap the microphone to speak your question')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {currentLanguage === 'te' 
              ? 'ఉదాహరణ: "ఈరోజు వర్షం పడుతుందా?", "పంటకు మందు కొట్టవచ్చా?"' 
              : currentLanguage === 'hi' 
              ? 'उदाहरण: "क्या आज बारिश होगी?", "क्या खाद डालना सही है?"' 
              : 'Example: "Will it rain tomorrow?", "Is it safe to spray pesticides?"'}
          </p>
        </div>
      </div>

      {/* Spoken Answer Playback Card */}
      {spokenResponse && (
        <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-700 shadow-md animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              {currentLanguage === 'te' ? 'సమాధానం:' : currentLanguage === 'hi' ? 'उत्तर:' : 'Spoken Audio Response:'}
            </span>
            <button
              onClick={() => {
                if (speaking) {
                  stopSpeaking();
                  setSpeaking(false);
                } else {
                  setSpeaking(true);
                  speakText(spokenResponse, currentLanguage, () => setSpeaking(false));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors"
            >
              {speaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              <span>{speaking ? 'ఆపండి (Stop)' : 'మళ్ళీ వినండి (Replay)'}</span>
            </button>
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
            {spokenResponse}
          </p>
        </div>
      )}

      {/* 4 Giant One-Touch Question Tiles */}
      <div>
        <h3 className="text-base font-black text-slate-800 dark:text-white mb-3">
          {currentLanguage === 'te' ? 'ఒక్క టచ్‌తో తెలుసుకోండి:' : currentLanguage === 'hi' ? 'एक स्पर्श में मौसम सलाह:' : 'One-Touch Instant Answers:'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {actions.map((act, idx) => (
            <button
              key={idx}
              onClick={() => handleSpeakQuery(act.title, act.answer)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-md text-left flex items-start gap-4 transition-all hover:scale-[1.02] active:scale-95 group"
            >
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 transition-colors shrink-0">
                {act.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  {act.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {act.answer}
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'te' ? 'వినడానికి నొక్కండి' : currentLanguage === 'hi' ? 'सुनने के लिए दबाएं' : 'Tap to Listen'}</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Direct Kisan Call Center Helpline */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            {currentLanguage === 'te' 
              ? 'ప్రభుత్వ కిసాన్ కాల్ సెంటర్ ఉచిత సహాయవాణి:' 
              : currentLanguage === 'hi' 
              ? 'राष्ट्रीय किसान कॉल सेंटर टोल-फ्री नंबर:' 
              : 'Toll-free Kisan Assistance Helpline:'}{' '}
            <strong>1800-180-1551</strong>
          </span>
        </div>
      </div>

    </div>
  );
}
