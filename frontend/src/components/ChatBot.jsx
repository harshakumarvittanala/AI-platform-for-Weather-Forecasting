import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CloudSun, 
  Droplets, 
  Wind, 
  ShieldAlert, 
  Bot, 
  User, 
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { translations } from '../translations';
import { createSpeechRecognizer, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../utils/speech';

export default function ChatBot({
  currentLanguage,
  locationName,
  weatherData,
  onNavigateToTab,
  customApiKey
}) {
  const t = translations[currentLanguage] || translations.en;

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: getWelcomeMessage(currentLanguage, locationName),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weatherCard: weatherData ? {
        location: weatherData.location?.name || locationName,
        temperature: weatherData.current?.temperature,
        feelsLike: weatherData.current?.feelsLike,
        condition: weatherData.current?.condition,
        humidity: weatherData.current?.humidity,
        windSpeed: weatherData.current?.windSpeed,
        aqi: weatherData.airQuality?.aqi,
        rainProb: weatherData.daily?.[0]?.rainProbability || 0
      } : null,
      suggestedQuestions: getInitialQuickQuestions(currentLanguage, locationName)
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle voice recognition toggle
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      currentLanguage,
      (result) => {
        if (result.final) {
          setInputText(result.final);
          // Auto submit if clear voice input received
          handleSendMessage(result.final);
        } else if (result.interim) {
          setInputText(result.interim);
        }
      },
      () => {
        setIsListening(false);
      },
      (error) => {
        console.warn('Speech recognizer error:', error);
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
        setIsListening(false);
      }
    }
  };

  // Handle Text-to-Speech
  const handleToggleSpeak = (msgId, text) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setSpeakingMsgId(msgId);
      speakText(text, currentLanguage, () => {
        setSpeakingMsgId(null);
      });
    }
  };

  // Submit User Message
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    setInputText('');
    stopSpeaking();
    setSpeakingMsgId(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId: 'client-session-1',
          userLocation: weatherData?.location,
          language: currentLanguage,
          customApiKey: customApiKey || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          weatherCard: data.weatherContext,
          intent: data.intent,
          source: data.source,
          suggestedQuestions: data.suggestedQuestions
        };
        setMessages((prev) => [...prev, botMessage]);

        // Auto-speak in Kisan/Rural mode if helpful
      } else {
        throw new Error(data.error || 'Failed to fetch response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: currentLanguage === 'te' 
            ? 'క్షమించండి, సర్వర్ నుండి సమాధానం పొందడంలో సమస్య ఎదురైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
            : currentLanguage === 'hi'
            ? 'क्षमा करें, सर्वर से प्रतिक्रिया प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered a temporary connection issue. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto px-4 py-3">
      
      {/* Context Banner */}
      <div className="flex items-center justify-between px-4 py-2 mb-2 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-900 border border-sky-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500 animate-spin-slow" />
          <span>
            {currentLanguage === 'te' ? 'వాతావరణ సహాయక వ్యవస్థ:' : currentLanguage === 'hi' ? 'सक्रिय मौसम संदर्भ:' : 'Active Location Intelligence:'}{' '}
            <strong className="text-slate-900 dark:text-white font-semibold">{locationName}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
            Live Sync: IMD & Open-Meteo
          </span>
          <button
            onClick={() => onNavigateToTab('dashboard')}
            className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-medium"
          >
            <span>Full Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = speakingMsgId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 shadow-sm ${
                isUser
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
              }`}>
                {/* Message Header & Audio Controls */}
                <div className="flex items-center justify-between mb-1.5 gap-4">
                  <span className={`text-[10px] font-medium ${isUser ? 'text-sky-200' : 'text-slate-400'}`}>
                    {msg.timestamp} {msg.source === 'GEMINI_AI' && '• Gemini AI'}
                  </span>
                  {!isUser && (
                    <button
                      onClick={() => handleToggleSpeak(msg.id, msg.text)}
                      className="p-1 rounded-md text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                      title={isSpeaking ? 'Stop Audio' : 'Listen to Answer (Audio)'}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-4 h-4 text-red-500 animate-pulse" />
                      ) : (
                        <Volume2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Message Text Content */}
                <div className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {msg.text}
                </div>

                {/* Embedded Weather Context Badge */}
                {msg.weatherCard && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <CloudSun className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-[10px] text-slate-500">Temp / Feel</p>
                        <p className="font-bold text-slate-800 dark:text-white">
                          {msg.weatherCard.temperature}°C ({msg.weatherCard.feelsLike}°C)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-sky-500" />
                      <div>
                        <p className="text-[10px] text-slate-500">Rain Chance</p>
                        <p className="font-bold text-slate-800 dark:text-white">
                          {msg.weatherCard.rainProb}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-teal-500" />
                      <div>
                        <p className="text-[10px] text-slate-500">Wind Speed</p>
                        <p className="font-bold text-slate-800 dark:text-white">
                          {msg.weatherCard.windSpeed} km/h
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-indigo-500" />
                      <div>
                        <p className="text-[10px] text-slate-500">Air Quality</p>
                        <p className="font-bold text-slate-800 dark:text-white">
                          AQI {msg.weatherCard.aqi}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Questions Chips */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-500" />
                      {t.quickQuestions}:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-slate-700 text-left transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
              <span>
                {currentLanguage === 'te' 
                  ? 'వాతావరణ ఉపగ్రహ సమాచారాన్ని విశ్లేషిస్తున్నాము...' 
                  : currentLanguage === 'hi' 
                  ? 'मौसम डेटा और उपग्रह चित्रों का विश्लेषण हो रहा है...' 
                  : 'Analyzing real-time meteorological models & IMD alerts...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar & Voice Controls */}
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
        
        {/* Listening Banner */}
        {isListening && (
          <div className="mb-2 py-1.5 px-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-semibold">{t.voiceListening}</span>
            </div>
            <button
              onClick={toggleListening}
              className="px-2 py-0.5 bg-red-200 dark:bg-red-900 rounded text-red-800 dark:text-red-200 text-[11px] font-bold"
            >
              Stop
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-md focus-within:ring-2 focus-within:ring-sky-500/40 transition-all"
        >
          {/* Speech-to-Text Microphone Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/30 animate-pulse'
                  : 'text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isListening ? 'Stop Listening' : t.voiceSpeak}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? t.voiceListening : t.askAnything}
            className="flex-1 px-3 py-2 text-sm sm:text-base bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-sky-500/20 transition-all"
            title="Send Query"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

function getWelcomeMessage(lang, loc) {
  if (lang === 'te') {
    return `నమస్కారం! నేను మీ **మౌసమ్‌వాణి AI** వాతావరణ సహాయకుడిని. \n` +
      `**${loc}** మరియు భారతదేశంలోని అన్ని ప్రాంతాల ప్రత్యక్ష వాతావరణం, వర్ష సూచనలు, తుఫాను హెచ్చరికలు మరియు రైతుల కోసం వ్యవసాయ సలహాలను అందించగలను.\n` +
      `మీరు వాయిస్ లేదా టెక్స్ట్ ద్వారా నన్ను ఏదైనా అడగవచ్చు!`;
  } else if (lang === 'hi') {
    return `नमस्ते! मैं आपका **मौसमवाणी AI** सहायक हूँ। \n` +
      `मैं आपको **${loc}** एवं पूरे देश के लिए लाइव मौसम पूर्वानुमान, भारी बारिश/चक्रवात अलर्ट और किसानों के लिए फसल व सिंचाई परामर्श प्रदान कर सकता हूँ।\n` +
      `माइक दबाकर बोलें या लिखकर प्रश्न पूछें!`;
  } else if (lang === 'ta') {
    return `வணக்கம்! நான் உங்கள் **மௌசம்வாணி AI** வானிலை உதவியாளர். \n` +
      `**${loc}** மற்றும் தமிழகத்திற்கான நேரலை வானிலை முன்னறிவிப்பு, கனமழை எச்சரிக்கைகள் மற்றும் விவசாய ஆலோசனைகளை வழங்க தயாராக உள்ளேன்.`;
  }
  return `Hello! I am **MausamVani AI**, your Conversational Weather, Early Alert & Climate Intelligence Assistant.\n` +
    `I provide real-time hyper-local weather forecasts, IMD-calibrated severe alerts, and decision support for agriculture, marine fisheries, aviation, and disaster preparedness in **${loc}** and across India.\n` +
    `Ask me via text or click the mic button to speak!`;
}

function getInitialQuickQuestions(lang, loc) {
  if (lang === 'te') {
    return [
      `రేపు ${loc} లో వర్షం పడుతుందా?`,
      `ఈరోజు పంటకు నీరు పెట్టవచ్చా లేదా ఎరువులు చల్లవచ్చా?`,
      `తీర ప్రాంతంలో తుఫాను హెచ్చరికలు ఉన్నాయా?`,
      `మత్స్యకారులు సముద్రంలోకి వెళ్లవచ్చా?`
    ];
  } else if (lang === 'hi') {
    return [
      `क्या आज ${loc} में बारिश होगी?`,
      `फसलों की सिंचाई और कीटनाशक छिड़काव की क्या सलाह है?`,
      `क्या कोई चक्रवात या भारी वर्षा का अलर्ट जारी है?`,
      `मछुआरों के लिए समुद्र की क्या स्थिति है?`
    ];
  }
  return [
    `Will it rain in ${loc} today or tomorrow?`,
    `Is it safe for farmers to spray pesticides today?`,
    `Are there any active cyclone or severe weather alerts?`,
    `What is the sea state and wave height for fishermen?`
  ];
}
