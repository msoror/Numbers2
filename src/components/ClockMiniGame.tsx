import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Calendar, Check, Lightbulb, Moon, Sun } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { usePausableTimer } from '../hooks/usePausableTimer';
import { BilingualText, ClockQuestion, Language, RoundAdvancePayload } from '../types/game';
import { soundEngine } from '../utils/sound';
import { AnalogClockSvg } from './EgyptSvgs';

interface ClockMiniGameProps {
  question: ClockQuestion;
  lang: Language;
  isPaused: boolean;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: (result: RoundAdvancePayload) => void;
}

const formatDigital = (hour: number, minute: number) =>
  `${hour}:${minute < 10 ? '0' : ''}${minute}`;

function buildClockWrongExplanation(
  question: ClockQuestion,
  chosenIdx?: number,
  setHour?: number,
  setMinute?: number
): BilingualText {
  if (question.kind === 'read_clock' && chosenIdx !== undefined) {
    const picked = question.options[chosenIdx];
    const pickedStr = formatDigital(picked.hour, picked.minute);
    return {
      en: `${pickedStr} doesn't match the clock hands: check the short red hour hand (${question.hour}) and count by 5s for the long minute hand!`,
      ar: `${pickedStr} لا يطابق العقارب: انظر للعقرب الأحمر القصير (${question.hour}) وعدّ بالخمسات لعقرب الدقائق الطويل!`,
    };
  }
  if (question.kind === 'set_clock' && setHour !== undefined && setMinute !== undefined) {
    const curStr = formatDigital(setHour, setMinute);
    const targetStr = formatDigital(question.targetHour, question.targetMinute);
    if (setHour !== question.targetHour && setMinute !== question.targetMinute) {
      return {
        en: `Your clock shows ${curStr}, not ${targetStr}. Adjust both the Hour and Minute buttons!`,
        ar: `الساعة الآن ${curStr} وليست ${targetStr}. عدّل أزرار الساعات والدقائق!`,
      };
    }
    if (setHour !== question.targetHour) {
      return {
        en: `Minutes look good, but the Hour is ${setHour} instead of ${question.targetHour}!`,
        ar: `الدقائق صحيحة، لكن الساعة ${setHour} بدلاً من ${question.targetHour}!`,
      };
    }
    return {
      en: `Hour ${setHour} is right, but Minutes show :${setMinute < 10 ? '0' : ''}${setMinute} instead of :${question.targetMinute < 10 ? '0' : ''}${question.targetMinute}!`,
      ar: `الساعة ${setHour} صحيحة، لكن الدقائق :${setMinute < 10 ? '0' : ''}${setMinute} بدلاً من :${question.targetMinute < 10 ? '0' : ''}${question.targetMinute}!`,
    };
  }
  return question.hint;
}

export const ClockMiniGame: React.FC<ClockMiniGameProps> = ({
  question,
  lang,
  isPaused,
  onAttempt,
  onAdvance,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);
  const [wrongExplanation, setWrongExplanation] = useState<BilingualText | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number[]>([]);
  const [shakeKey, setShakeKey] = useState<string | null>(null);

  const [setHour, setSetHour] = useState(12);
  const [setMinute, setSetMinute] = useState(0);

  const { schedule, cancel } = usePausableTimer(isPaused);

  useEffect(() => {
    cancel();
    setShowHint(false);
    setSolved(false);
    setHadMistake(false);
    setWrongExplanation(null);
    setWrongIdx([]);
    setShakeKey(null);
    if (question.kind === 'set_clock') {
      setSetHour(question.startHour);
      setSetMinute(question.startMinute);
    }
  }, [question, cancel]);

  const triggerWin = () => {
    if (isPaused || solved) return;
    setSolved(true);
    soundEngine.playCorrect();
    onAttempt(true);
    if (!hadMistake) {
      schedule(() => onAdvance({ correctFirstTry: true }), 950);
    }
  };

  const triggerMiss = (key: string, idx?: number) => {
    if (isPaused || solved) return;
    soundEngine.playGentleMiss();
    setHadMistake(true);
    if (idx !== undefined) setWrongIdx((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    setWrongExplanation(buildClockWrongExplanation(question, idx, setHour, setMinute));
    setShakeKey(key);
    setShowHint(true);
    onAttempt(false);
    setTimeout(() => setShakeKey(null), 260);
  };

  const handleOptionPick = (idx: number, correctIdx: number) => {
    if (isPaused || solved || wrongIdx.includes(idx)) return;
    if (idx === correctIdx) triggerWin();
    else triggerMiss(`opt-${idx}`, idx);
  };

  const adjustHour = (delta: number) => {
    if (isPaused || solved) return;
    soundEngine.playClick();
    setSetHour((h) => ((h - 1 + delta + 12) % 12) + 1);
  };

  const adjustMinute = (delta: number) => {
    if (isPaused || solved) return;
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
    if (isPaused || question.kind !== 'set_clock' || solved) return;
    if (setHour === question.targetHour && setMinute === question.targetMinute) {
      triggerWin();
    } else {
      triggerMiss('check-clock');
    }
  };

  const handleManualNext = () => {
    if (isPaused || !solved) return;
    cancel();
    soundEngine.playClick();
    onAdvance({ correctFirstTry: !hadMistake });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (solved) {
        if (hadMistake && e.key === 'Enter') {
          e.preventDefault();
          handleManualNext();
        }
        return;
      }
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

  const needsManualNext = solved && hadMistake;

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

      {/* Zone 1: Top Prompt */}
      <div className="relative z-10 pt-16 sm:pt-17 px-3 sm:px-4 flex justify-center shrink-0">
        <div className="bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-md text-center max-w-2xl w-full">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-[#133C3B] leading-snug">
            {t(question.prompt, lang)}
          </h2>
        </div>
      </div>

      {/* Zone 2: Scroll-Safe Clocktower Stage */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-3 sm:px-4 py-2">
        {question.kind === 'read_clock' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center gap-2.5">
            <AnalogClockSvg hour={question.hour} minute={question.minute} size={196} />
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
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <AnalogClockSvg hour={setHour} minute={setMinute} size={184} />

            <div className="flex flex-col items-center gap-2.5">
              <div
                dir="ltr"
                className="px-5 py-2 rounded-2xl bg-[#133C3B] text-[#FFFDF7] font-display text-2xl sm:text-3xl font-bold tabular-nums"
              >
                {formatDigital(setHour, setMinute)}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isPaused || solved}
                  onClick={() => adjustHour(-1)}
                  className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] font-bold text-xs sm:text-sm cursor-pointer hover:scale-[1.02] whitespace-nowrap"
                >
                  {t(UI_TEXT.stepBackHour, lang)}
                </button>
                <button
                  type="button"
                  disabled={isPaused || solved}
                  onClick={() => adjustHour(1)}
                  className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-[#FEE2E2] border-2 border-[#DC2626] text-[#991B1B] font-bold text-xs sm:text-sm cursor-pointer hover:scale-[1.02] whitespace-nowrap"
                >
                  {t(UI_TEXT.stepForwardHour, lang)}
                </button>
                {(() => {
                  const step = question.stepMinutes ?? 15;
                  return (
                    <>
                      <button
                        type="button"
                        disabled={isPaused || solved}
                        onClick={() => adjustMinute(-step)}
                        className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-[#CCFBF1] border-2 border-[#0D9488] text-[#115E59] font-bold text-xs sm:text-sm cursor-pointer hover:scale-[1.02] whitespace-nowrap"
                      >
                        {step === 5 ? t(UI_TEXT.stepBack5, lang) : t(UI_TEXT.stepBack15, lang)}
                      </button>
                      <button
                        type="button"
                        disabled={isPaused || solved}
                        onClick={() => adjustMinute(step)}
                        className="h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-[#CCFBF1] border-2 border-[#0D9488] text-[#115E59] font-bold text-xs sm:text-sm cursor-pointer hover:scale-[1.02] whitespace-nowrap"
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
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-7 shadow-xl flex flex-col items-center gap-3.5 max-w-md w-full">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-center text-[#B45309]">
              <Calendar className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div
              dir="ltr"
              className="font-display text-2xl sm:text-3xl font-bold text-[#133C3B] bg-[#F1F5F9] px-5 py-2.5 rounded-2xl border border-[#CBD5E1] tabular-nums text-center"
            >
              {t(question.displayBadge, lang)}
            </div>
          </div>
        )}
      </div>

      {/* Zone 3: Dedicated Mistake Explanation / Hint Strip */}
      {(wrongExplanation || showHint) && (
        <div className="relative z-10 px-3 sm:px-4 pb-1.5 flex justify-center shrink-0">
          <div className="w-full max-w-2xl bg-[#FFFDF7]/96 border-2 border-[#1D4ED8] rounded-2xl px-3.5 py-2 shadow-sm flex items-start gap-2 text-xs sm:text-sm font-bold">
            {wrongExplanation ? (
              <>
                <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span className="text-[#991B1B] leading-snug">
                  <span className="font-extrabold">{t(UI_TEXT.whyWrongLabel, lang)}</span>{' '}
                  {t(wrongExplanation, lang)}
                </span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <span className="text-[#92400E] leading-snug">{t(question.hint, lang)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Zone 4: Bottom Answer Controls */}
      <div className="relative z-10 pb-4 sm:pb-6 px-3 sm:px-4 flex justify-center shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl">
          {needsManualNext ? (
            <button
              type="button"
              disabled={isPaused}
              onClick={handleManualNext}
              className="h-14 sm:h-16 px-8 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] border-2 border-b-[5px] border-[#14532D] text-white font-display text-xl font-bold flex items-center gap-2 shadow-md cursor-pointer whitespace-nowrap"
            >
              <span>{t(UI_TEXT.nextQuestion, lang)}</span>
              <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <>
              {question.kind === 'read_clock' &&
                question.options.map((opt, idx) => {
                  const isWrong = wrongIdx.includes(idx);
                  const isCorrect = solved && idx === question.correctIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPaused || solved || isWrong}
                      onClick={() => handleOptionPick(idx, question.correctIndex)}
                      dir="ltr"
                      className={`relative min-w-[88px] sm:min-w-[104px] h-14 sm:h-16 px-4 sm:px-5 rounded-2xl font-display text-xl sm:text-2xl font-bold tabular-nums border-2 border-b-[5px] transition-transform cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === `opt-${idx}` ? 'animate-gentle-shake' : ''}`}
                    >
                      <span>{formatDigital(opt.hour, opt.minute)}</span>
                      <span className="hidden sm:inline absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}

              {question.kind === 'set_clock' && (
                <button
                  type="button"
                  disabled={isPaused || solved}
                  onClick={handleCheckSetClock}
                  className={`h-14 sm:h-16 px-8 rounded-2xl border-2 border-b-[5px] font-display text-lg sm:text-xl font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
                      disabled={isPaused || solved || isWrong}
                      onClick={() => handleOptionPick(idx, question.correctIndex)}
                      className={`relative min-w-[100px] sm:min-w-[120px] h-14 sm:h-16 px-4 sm:px-5 rounded-2xl font-display text-base sm:text-xl font-bold border-2 border-b-[5px] transition-transform cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === `opt-${idx}` ? 'animate-gentle-shake' : ''}`}
                    >
                      <span>{t(opt, lang)}</span>
                      <span className="hidden sm:inline absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}

              <button
                type="button"
                disabled={isPaused}
                onClick={() => {
                  if (isPaused) return;
                  soundEngine.playClick();
                  setShowHint((p) => !p);
                }}
                className="h-14 sm:h-16 px-3.5 sm:px-4 rounded-2xl bg-[#FEF9C3] border-2 border-b-[5px] border-[#A16207] text-[#713F12] font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{showHint ? t(UI_TEXT.hintOn, lang) : t(UI_TEXT.hint, lang)}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
