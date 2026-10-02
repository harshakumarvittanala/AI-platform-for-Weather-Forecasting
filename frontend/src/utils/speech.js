/**
 * Voice & Audio Utilities
 * Speech Recognition (STT), Speech Synthesis (TTS), and Web Audio Siren Generator
 */

const LANG_CODE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ta: 'ta-IN',
  kn: 'kn-IN',
  mr: 'mr-IN',
  bn: 'bn-IN'
};

/**
 * Check if Speech Recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

/**
 * Create and configure Speech Recognition instance
 */
export function createSpeechRecognizer(lang = 'en', onResult, onEnd, onError) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = LANG_CODE_MAP[lang] || 'en-IN';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (onResult) {
      onResult({
        final: finalTranscript,
        interim: interimTranscript,
        rawText: finalTranscript || interimTranscript
      });
    }
  };

  recognition.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}

/**
 * Text-to-Speech (TTS) Reader
 */
export function speakText(text, lang = 'en', onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting (*, #, bullet symbols) for cleaner audio
  const cleanText = text
    .replace(/[*#_`>]/g, '')
    .replace(/•/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = LANG_CODE_MAP[lang] || 'en-IN';
  utterance.rate = 0.95; // Slightly slower for better rural comprehension
  utterance.pitch = 1.0;

  // Attempt to find matching voice
  const voices = window.speechSynthesis.getVoices();
  const targetCode = LANG_CODE_MAP[lang] || 'en-IN';
  const matchedVoice = voices.find(v => v.lang.startsWith(targetCode.slice(0, 2)));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop speech playback
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Play emergency siren tone using Web Audio API
 */
export function playEmergencySiren(durationSeconds = 3) {
  if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);

    // Siren modulation between 650Hz and 950Hz
    const now = ctx.currentTime;
    for (let i = 0; i < durationSeconds * 2; i++) {
      osc.frequency.setValueAtTime(650, now + i * 0.5);
      osc.frequency.exponentialRampToValueAtTime(950, now + i * 0.5 + 0.25);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + durationSeconds);
  } catch (e) {
    console.warn('AudioContext siren failed:', e.message);
  }
}
