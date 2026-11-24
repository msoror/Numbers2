import { Language } from '../types/game';

/**
 * Checks whether the browser supports the Web Speech Synthesis API.
 */
export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  );
}

/**
 * Cancels any active speech synthesis utterance cleanly.
 */
export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore speech synthesis errors on restricted platforms
  }
}

/**
 * Reads text aloud in English or Arabic using the browser Web Speech API.
 * Gracefully no-ops and returns false if speech synthesis is unsupported.
 */
export function speakText(
  text: string,
  lang: Language,
  onEnd?: () => void
): boolean {
  if (!isSpeechSupported() || !text.trim()) {
    onEnd?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    const targetLang = lang === 'ar' ? 'ar-EG' : 'en-US';
    utterance.lang = targetLang;
    utterance.rate = lang === 'ar' ? 0.92 : 0.95;
    utterance.pitch = 1.04;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(lang));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}
