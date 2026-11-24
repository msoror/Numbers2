import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Check, Lightbulb, Moon, Sun } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { ClockQuestion, Language } from '../types/game';
import { soundEngine } from '../utils/sound';
import { AnalogClockSvg } from './EgyptSvgs';

interface ClockMiniGameProps {
  question: ClockQuestion;
  lang: Language;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: () => void;
}

const formatDigital = (hour: number, minute: number) =>
  `${hour}:${minute < 10 ? '0' : ''}${minute}`;

export const ClockMiniGame: React.FC<ClockMiniGameProps> = ({
  question,
  lang,
  onAttempt,
  onAdvance,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrongIdx, setWrongIdx] = useState<number[]>([]);
  const [shakeKey, setShakeKey] = useState<string | null>(null);

  const [setHour, setSetHour] = useState(12);
  const [setMinute, setSetMinute] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowHint(false);
    setSolved(false);
    setWrongIdx([]);
    setShakeKey(null);
    if (question.kind === 'set_clock') {
      setSetHour(question.startHour);
      setSetMinute(question.startMinute);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question]);

  const triggerWin = () => {
    setSolved(true);
    soundEngine.playCorrect();
    onAttempt(true);
    timerRef.current = setTimeout(() => onAdvance(), 950);
  };

  const triggerMiss = (key: string, idx?: number) => {
    soundEngine.playGentleMiss();
    if (idx !== undefined) setWrongIdx((prev) => [...prev, idx]);
    setShakeKey(key);
    setShowHint(true);
    onAttempt(false);
    setTimeout(() => setShakeKey(null), 260);
  };

  const handleOptionPick = (idx: number, correctIdx: number) => {
    if (solved || wrongIdx.includes(idx)) return;
    if (idx === correctIdx) triggerWin();
    else triggerMiss(`opt-${idx}`, idx);
  };

  const adjustHour = (delta: number) => {
    if (solved) return;
    soundEngine.playClick();
    setSetHour((h) => {
      const next = ((h - 1 + delta + 12) % 12) + 1;
      return next;
    });
  };

  const adjustMinute = (delta: number) => {
    if (solved) return;
    soundEngine.playTapNote(Math.abs(delta));
    setSetMinute((m) => {
      let nextM = m + delta;
      if (nextM >= 60) {
        nextM -= 60;
        setSetHour((h) => (h % 12) + 1);
      } else if (nextM < 0) {
        nextM += 60;
        setSetHour((h) => (h === 1 ? 12 : h - 1));
      }
      return nextM;
    });
  };

  const handleCheckSetClock = () => {
    if (question.kind !== 'set_clock' || solved) return;
    if (setHour === question.targetHour && setMinute === question.targetMinute) {
      triggerWin();
    } else {
      triggerMiss('check-clock');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (solved) return;
      if (e.key.toLowerCase() === 'h') {
        soundEngine.playClick();
        setShowHint((p) => !p);
        return;
      }
      if (question.kind === 'read_clock' || question.kind === 'elapsed_or_calendar') {
        if (e.key >= '1' && e.key <= '4') {
          const idx = Number(e.key) - 1;
          if (question.options[idx] !== undefined) {
            handleOptionPick(idx, question.correctIndex);
          }
        }
      } else if (question.kind === 'set_clock' && e.key === 'Enter') {
        handleCheckSetClock();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Oasis Clocktower Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#BAE6FD] via-[#FEF3C7] to-[#D97706]"
        aria-hidden="true"
      >
        <img
          src="/src/assets/images/egypt_clocktower_bg_1794872911604.jpg"
          alt="Sunlit Egyptian oasis clocktower courtyard"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/25" />
      </div>

      {/* Top Prompt */}
      <div className="relative z-10 pt-16 px-4 flex justify-center">
        <div className="bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl px-6 py-3 shadow-md text-center max-w-2xl">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#133C3B]">
            {t(question.prompt, lang)}
          </h2>
          {showHint && (
            <p className="mt-1 text-sm font-bold text-[#B45309]">
              {t(question.hint, lang)}
            </p>
          )}
        </div>
      </div>

      {/* Center Clocktower Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">
        {question.kind === 'read_clock' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center gap-3">
            <AnalogClockSvg hour={question.hour} minute={question.minute} size={220} />
            <div className="flex items-center gap-2 text-sm font-bold text-[#133C3B]">
              {question.dayPeriod === 'am' ? (
                <>
                  <Sun className="w-5 h-5 text-[#F59E0B]" />
                  <span>{t(UI_TEXT.morningAm, lang)}</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-[#0284C7]" />
                  <span>{t(UI_TEXT.eveningPm, lang)}</span>
                </>
              )}
            </div>
          </div>
        )}

        {question.kind === 'set_clock' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6">
            <AnalogClockSvg hour={setHour} minute={setMinute} size={215} />

            <div className="flex flex-col items-center gap-3">
              <div
                dir="ltr"
                className="px-5 py-2.5 rounded-2xl bg-[#133C3B] text-[#FFFDF7] font-display text-3xl font-bold tabular-nums"
              >
                {formatDigital(setHour, setMinute)}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => adjustHour(-1)}
                  className="h-12 px-4 rounded-xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] font-bold text-sm cursor-pointer hover:scale-[1.02]"
                >
                  {t(UI_TEXT.stepBackHour, lang)}
                </button>
                <button
                  type="button"
                  disabled={solved}
                  onClick={() => adjustHour(1)}
                  className="h-12 px-4 rounded-xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] font-bold text-sm cursor-pointer hover:scale-[1.02]"
                >
                  {t(UI_TEXT.stepForwardHour, lang)}
                </button>
                {(() => {
                  const step = question.stepMinutes ?? 15;
                  return (
                    <>
                      <button
                        type="button"
                        disabled={solved}
                        onClick={() => adjustMinute(-step)}
                        className="h-12 px-4 rounded-xl bg-[#CCFBF1] border-2 border-[#0D9488] text-[#115E59] font-bold text-sm cursor-pointer hover:scale-[1.02] whitespace-nowrap"
                      >
                        {step === 5 ? t(UI_TEXT.stepBack5, lang) : t(UI_TEXT.stepBack15, lang)}
                      </button>
                      <button
                        type="button"
                        disabled={solved}
                        onClick={() => adjustMinute(step)}
                        className="h-12 px-4 rounded-xl bg-[#CCFBF1] border-2 border-[#0D9488] text-[#115E59] font-bold text-sm cursor-pointer hover:scale-[1.02] whitespace-nowrap"
                      >
                        {step === 5 ? t(UI_TEXT.stepForward5, lang) : t(UI_TEXT.stepForward15, lang)}
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {question.kind === 'elapsed_or_calendar' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-7 shadow-xl flex flex-col items-center gap-4 max-w-md w-full">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-center text-[#B45309]">
              <Calendar className="w-8 h-8" />
            </div>
            <div
              dir="ltr"
              className="font-display text-3xl font-bold text-[#133C3B] bg-[#F1F5F9] px-6 py-3 rounded-2xl border border-[#CBD5E1] tabular-nums"
            >
              {t(question.displayBadge, lang)}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 pb-6 px-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {question.kind === 'read_clock' &&
            question.options.map((opt, idx) => {
              const isWrong = wrongIdx.includes(idx);
              const isCorrect = solved && idx === question.correctIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={solved || isWrong}
                  onClick={() => handleOptionPick(idx, question.correctIndex)}
                  dir="ltr"
                  className={`relative min-w-[104px] h-16 px-5 rounded-2xl font-display text-2xl font-bold tabular-nums border-2 border-b-[5px] transition-transform cursor-pointer ${
                    isCorrect
                      ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                      : isWrong
                      ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                      : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                  } ${shakeKey === `opt-${idx}` ? 'animate-gentle-shake' : ''}`}
                >
                  <span>{formatDigital(opt.hour, opt.minute)}</span>
                  <span className="absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                    {idx + 1}
                  </span>
                </button>
              );
            })}

          {question.kind === 'set_clock' && (
            <button
              type="button"
              disabled={solved}
              onClick={handleCheckSetClock}
              className={`h-16 px-8 rounded-2xl border-2 border-b-[5px] font-display text-xl font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                solved
                  ? 'bg-[#16A34A] border-[#14532D] text-white'
                  : 'bg-[#F59E0B] hover:bg-[#D97706] border-[#133C3B] text-white'
              } ${shakeKey === 'check-clock' ? 'animate-gentle-shake' : ''}`}
            >
              <Check className="w-5 h-5" />
              <span>{t(UI_TEXT.checkAnswer, lang)}</span>
            </button>
          )}

          {question.kind === 'elapsed_or_calendar' &&
            question.options.map((opt, idx) => {
              const isWrong = wrongIdx.includes(idx);
              const isCorrect = solved && idx === question.correctIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={solved || isWrong}
                  onClick={() => handleOptionPick(idx, question.correctIndex)}
                  className={`relative min-w-[120px] h-16 px-5 rounded-2xl font-display text-lg sm:text-xl font-bold border-2 border-b-[5px] transition-transform cursor-pointer ${
                    isCorrect
                      ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                      : isWrong
                      ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                      : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                  } ${shakeKey === `opt-${idx}` ? 'animate-gentle-shake' : ''}`}
                >
                  <span>{t(opt, lang)}</span>
                  <span className="absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                    {idx + 1}
                  </span>
                </button>
              );
            })}

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShowHint((p) => !p);
            }}
            className="h-16 px-4 rounded-2xl bg-[#FEF9C3] border-2 border-b-[5px] border-[#A16207] text-[#713F12] font-bold text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Lightbulb className="w-5 h-5" />
            <span>{showHint ? t(UI_TEXT.hintOn, lang) : t(UI_TEXT.hint, lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
