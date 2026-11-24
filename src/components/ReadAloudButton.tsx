import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { Language } from '../types/game';
import { isSpeechSupported, speakText, stopSpeech } from '../utils/speech';

interface ReadAloudButtonProps {
  text: string;
  lang: Language;
  disabled?: boolean;
  compact?: boolean;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({
  text,
  lang,
  disabled = false,
  compact = false,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const supported = isSpeechSupported();

  // Stop speaking if text, language, or disabled state changes or component unmounts
  useEffect(() => {
    setSpeaking(false);
    stopSpeech();
    return () => {
      stopSpeech();
    };
  }, [text, lang, disabled]);

  const handleToggle = () => {
    if (!supported || disabled) return;
    if (speaking) {
      stopSpeech();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const started = speakText(text, lang, () => setSpeaking(false));
    if (!started) setSpeaking(false);
  };

  if (!supported) {
    return (
      <button
        type="button"
        disabled
        title={t(UI_TEXT.readAloudUnsupported, lang)}
        aria-label={t(UI_TEXT.readAloudUnsupported, lang)}
        className="h-8 px-2.5 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] text-[#94A3B8] text-xs font-bold inline-flex items-center gap-1 cursor-not-allowed shrink-0"
      >
        <VolumeX className="w-3.5 h-3.5" />
        {!compact && <span className="hidden sm:inline">{t(UI_TEXT.readAloud, lang)}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleToggle}
      aria-pressed={speaking}
      aria-label={speaking ? t(UI_TEXT.stopReading, lang) : t(UI_TEXT.readAloud, lang)}
      title={speaking ? t(UI_TEXT.stopReading, lang) : t(UI_TEXT.readAloud, lang)}
      className={`h-8 px-2.5 rounded-xl border-2 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#133C3B] ${
        speaking
          ? 'bg-[#CCFBF1] border-[#0D9488] text-[#115E59]'
          : 'bg-[#FEF3C7] hover:bg-[#FDE68A] border-[#133C3B]/30 text-[#133C3B]'
      }`}
    >
      <Volume2 className={`w-3.5 h-3.5 shrink-0 ${speaking ? 'animate-pulse text-[#0D9488]' : ''}`} />
      {!compact && (
        <span className="hidden sm:inline whitespace-nowrap">
          {speaking ? t(UI_TEXT.stopReading, lang) : t(UI_TEXT.readAloud, lang)}
        </span>
      )}
    </button>
  );
};
