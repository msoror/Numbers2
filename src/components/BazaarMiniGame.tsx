import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Lightbulb, RotateCcw } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { usePausableTimer } from '../hooks/usePausableTimer';
import { BazaarQuestion, BilingualText, Language, RoundAdvancePayload } from '../types/game';
import egyptBazaarBg from '../assets/images/egypt_bazaar_bg.webp';
import { soundEngine } from '../utils/sound';
import { EgyptianBanknoteSvg } from './EgyptSvgs';
import { ReadAloudButton } from './ReadAloudButton';

interface BazaarMiniGameProps {
  question: BazaarQuestion;
  lang: Language;
  isPaused: boolean;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: (result: RoundAdvancePayload) => void;
}

function buildBazaarWrongExplanation(
  question: BazaarQuestion,
  chosenLabel: string | number,
  traySum?: number
): BilingualText {
  if (question.kind === 'place_value') {
    return {
      en: `${chosenLabel} doesn't match the blocks: count ${question.hundreds} Hundreds (${question.hundreds * 100}) + ${question.tens} Tens (${question.tens * 10}) + ${question.ones} Ones.`,
      ar: `${chosenLabel} لا يطابق المكعبات: احسب ${question.hundreds} مئات (${question.hundreds * 100}) + ${question.tens} عشرات (${question.tens * 10}) + ${question.ones} آحاد.`,
    };
  }
  if (question.kind === 'money_build') {
    const sum = traySum ?? 0;
    const diff = Math.abs(question.targetAmount - sum);
    if (sum < question.targetAmount) {
      return {
        en: `You placed ${sum} LE — that is ${diff} LE short of ${question.targetAmount} LE. Add more notes!`,
        ar: `وضعت ${sum} ج.م — ينقصك ${diff} ج.م للوصول إلى ${question.targetAmount} ج.م. أضف أوراقًا أخرى!`,
      };
    }
    return {
      en: `You placed ${sum} LE — that is ${diff} LE over ${question.targetAmount} LE. Tap a note on the counter to remove it!`,
      ar: `وضعت ${sum} ج.م — هذا أكثر بـ ${diff} ج.م من ${question.targetAmount} ج.م. اضغط على ورقة لإزالتها!`,
    };
  }
  if (question.subKind === 'compare') {
    const relationEn =
      question.leftValue < question.rightValue
        ? `${question.leftValue} is smaller than ${question.rightValue}`
        : question.leftValue > question.rightValue
        ? `${question.leftValue} is greater than ${question.rightValue}`
        : `${question.leftValue} equals ${question.rightValue}`;
    const relationAr =
      question.leftValue < question.rightValue
        ? `${question.leftValue} أصغر من ${question.rightValue}`
        : question.leftValue > question.rightValue
        ? `${question.leftValue} أكبر من ${question.rightValue}`
        : `${question.leftValue} يساوي ${question.rightValue}`;
    return {
      en: `Not "${chosenLabel}" — compare from left to right: ${relationEn}.`,
      ar: `ليست "${chosenLabel}" — قارن من اليسار لليمين: ${relationAr}.`,
    };
  }
  return {
    en: `${chosenLabel} LE is not the exact change. Subtract ${question.rightValue} from ${question.leftValue} (or count up from ${question.rightValue}).`,
    ar: `${chosenLabel} ج.م ليست الباقي الصحيح. اطرح ${question.rightValue} من ${question.leftValue}.`,
  };
}

export const BazaarMiniGame: React.FC<BazaarMiniGameProps> = ({
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
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [trayNotes, setTrayNotes] = useState<number[]>([]);
  const [highlightedCol, setHighlightedCol] = useState<'h' | 't' | 'o' | null>(null);

  const { schedule, cancel } = usePausableTimer(isPaused);

  useEffect(() => {
    cancel();
    setShowHint(false);
    setSolved(false);
    setHadMistake(false);
    setWrongExplanation(null);
    setWrongKeys([]);
    setShakeKey(null);
    setTrayNotes([]);
    setHighlightedCol(null);
  }, [question.id, cancel]);

  const handleCorrect = () => {
    if (isPaused || solved) return;
    setSolved(true);
    soundEngine.playCorrect();
    onAttempt(true);
    if (!hadMistake) {
      schedule(() => onAdvance({ correctFirstTry: true }), 950);
    }
  };

  const handleMiss = (key: string, chosenLabel: string | number, currentTraySum?: number) => {
    if (isPaused || solved) return;
    soundEngine.playGentleMiss();
    setHadMistake(true);
    if (key !== 'check-money') {
      setWrongKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    }
    setWrongExplanation(buildBazaarWrongExplanation(question, chosenLabel, currentTraySum));
    setShakeKey(key);
    setShowHint(true);
    onAttempt(false);
    setTimeout(() => setShakeKey(null), 260);
  };

  const handleNumberPick = (val: number, expected: number) => {
    const key = String(val);
    if (isPaused || solved || wrongKeys.includes(key)) return;
    if (val === expected) handleCorrect();
    else handleMiss(key, val);
  };

  const handleComparePick = (sym: '<' | '=' | '>') => {
    if (isPaused || question.kind !== 'money_change_or_compare' || solved || wrongKeys.includes(sym)) {
      return;
    }
    if (sym === question.answerCompare) handleCorrect();
    else handleMiss(sym, sym);
  };

  const traySum = trayNotes.reduce((s, n) => s + n, 0);

  const handleCheckMoney = () => {
    if (isPaused || question.kind !== 'money_build' || solved) return;
    if (traySum === question.targetAmount) {
      handleCorrect();
    } else {
      handleMiss('check-money', traySum, traySum);
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
      if (question.kind === 'place_value' && e.key >= '1' && e.key <= '4') {
        const val = question.options[Number(e.key) - 1];
        if (val !== undefined) handleNumberPick(val, question.value);
      } else if (question.kind === 'money_change_or_compare') {
        if (question.subKind === 'compare') {
          const map: Record<string, '<' | '=' | '>'> = { '1': '<', '2': '=', '3': '>' };
          if (map[e.key]) handleComparePick(map[e.key]);
        } else if (e.key >= '1' && e.key <= '4' && question.optionsNumber) {
          const val = question.optionsNumber[Number(e.key) - 1];
          if (val !== undefined && question.answerNumber !== undefined) {
            handleNumberPick(val, question.answerNumber);
          }
        }
      } else if (question.kind === 'money_build' && e.key === 'Enter') {
        handleCheckMoney();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const needsManualNext = solved && hadMistake;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Cairo Bazaar Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FDE68A] via-[#E5C185] to-[#B45309]"
        aria-hidden="true"
      >
        <img
          src={egyptBazaarBg}
          alt=""
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25" />
      </div>

      {/* Zone 1: Top Prompt Card */}
      <div className="relative z-10 pt-16 sm:pt-17 px-3 sm:px-4 flex justify-center shrink-0">
        <div className="bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-md max-w-2xl w-full flex items-center justify-between gap-2.5">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-[#133C3B] leading-snug text-center flex-1">
            {t(question.prompt, lang)}
          </h2>
          <ReadAloudButton text={t(question.prompt, lang)} lang={lang} disabled={isPaused} compact />
        </div>
      </div>

      {/* Zone 2: Scroll-Safe Visual Model Stage */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-3 sm:px-4 py-2">
        {question.kind === 'place_value' && (
          <div
            dir="ltr"
            role="group"
            aria-label={
              lang === 'ar'
                ? question.hundreds > 0
                  ? `مكعبات القيمة المكانية: ${question.hundreds} مئات و ${question.tens} عشرات و ${question.ones} آحاد`
                  : `مكعبات القيمة المكانية: ${question.tens} عشرات و ${question.ones} آحاد`
                : question.hundreds > 0
                ? `Place value blocks: ${question.hundreds} hundreds, ${question.tens} tens, and ${question.ones} ones`
                : `Place value blocks: ${question.tens} tens and ${question.ones} ones`
            }
            className="w-full max-w-3xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-3 sm:p-6 shadow-xl grid grid-cols-3 gap-2 sm:gap-5"
          >
            {/* Hundreds Column */}
            <button
              type="button"
              disabled={isPaused}
              aria-label={
                lang === 'ar'
                  ? `${question.hundreds} مئات`
                  : `${question.hundreds} hundreds`
              }
              onClick={() => {
                if (isPaused) return;
                soundEngine.playTapNote(0);
                setHighlightedCol('h');
              }}
              className={`rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-between gap-1.5 sm:gap-2 transition-transform cursor-pointer ${
                highlightedCol === 'h'
                  ? 'bg-[#FFEDD5] border-[#EA580C] scale-[1.02]'
                  : 'bg-[#FFF7ED] border-[#FDBA74]'
              }`}
            >
              <span className="text-[11px] sm:text-sm font-bold text-[#9A3412]">
                {t(UI_TEXT.hundreds, lang)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 min-h-[64px] sm:min-h-[86px]">
                {Array.from({ length: question.hundreds }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-[#F97316] border-2 border-[#7C2D12] grid grid-cols-3 gap-px p-0.5"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 9 }, (_, c) => (
                      <span key={c} className="bg-[#FED7AA]/70 rounded-[1px]" />
                    ))}
                  </div>
                ))}
              </div>
              <span className="font-display text-sm sm:text-lg font-bold text-[#7C2D12] tabular-nums">
                {showHint || highlightedCol === 'h' ? question.hundreds * 100 : `${question.hundreds} × 100`}
              </span>
            </button>

            {/* Tens Column */}
            <button
              type="button"
              disabled={isPaused}
              aria-label={
                lang === 'ar'
                  ? `${question.tens} عشرات`
                  : `${question.tens} tens`
              }
              onClick={() => {
                if (isPaused) return;
                soundEngine.playTapNote(2);
                setHighlightedCol('t');
              }}
              className={`rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-between gap-1.5 sm:gap-2 transition-transform cursor-pointer ${
                highlightedCol === 't'
                  ? 'bg-[#CCFBF1] border-[#0D9488] scale-[1.02]'
                  : 'bg-[#F0FDFA] border-[#5EEAD4]'
              }`}
            >
              <span className="text-[11px] sm:text-sm font-bold text-[#115E59]">
                {t(UI_TEXT.tens, lang)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1 min-h-[64px] sm:min-h-[86px]">
                {Array.from({ length: question.tens }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-2 sm:w-2.5 h-9 sm:h-11 rounded-sm bg-[#14B8A6] border border-[#134E4A]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-display text-sm sm:text-lg font-bold text-[#115E59] tabular-nums">
                {showHint || highlightedCol === 't' ? question.tens * 10 : `${question.tens} × 10`}
              </span>
            </button>

            {/* Ones Column */}
            <button
              type="button"
              disabled={isPaused}
              aria-label={
                lang === 'ar'
                  ? `${question.ones} آحاد`
                  : `${question.ones} ones`
              }
              onClick={() => {
                if (isPaused) return;
                soundEngine.playTapNote(4);
                setHighlightedCol('o');
              }}
              className={`rounded-2xl border-2 p-2 sm:p-3 flex flex-col items-center justify-between gap-1.5 sm:gap-2 transition-transform cursor-pointer ${
                highlightedCol === 'o'
                  ? 'bg-[#FEF3C7] border-[#D97706] scale-[1.02]'
                  : 'bg-[#FEFCE8] border-[#FDE047]'
              }`}
            >
              <span className="text-[11px] sm:text-sm font-bold text-[#854D0E]">
                {t(UI_TEXT.ones, lang)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 min-h-[64px] sm:min-h-[86px] max-w-[110px]">
                {Array.from({ length: question.ones }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm bg-[#F59E0B] border border-[#78350F]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-display text-sm sm:text-lg font-bold text-[#854D0E] tabular-nums">
                {question.ones}
              </span>
            </button>
          </div>
        )}

        {question.kind === 'money_build' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-2.5">
            <div className="w-full bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-3.5 sm:p-5 shadow-xl flex flex-col gap-2.5 sm:gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2">
                <div className="font-display text-base sm:text-xl font-bold text-[#133C3B] tabular-nums">
                  {t(UI_TEXT.target, lang)}:{' '}
                  <span className="text-[#D97706]">
                    {question.targetAmount} {t(UI_TEXT.leUnit, lang)}
                  </span>
                </div>
                <div
                  className={`font-display text-base sm:text-xl font-bold tabular-nums ${
                    traySum === question.targetAmount ? 'text-[#16A34A]' : 'text-[#0D9488]'
                  }`}
                >
                  {t(UI_TEXT.collected, lang)}: {traySum} {t(UI_TEXT.leUnit, lang)}
                </div>
              </div>

              <div className="min-h-[64px] sm:min-h-[76px] flex flex-wrap items-center justify-center gap-2 bg-[#F7F1E3] rounded-2xl p-2.5 border border-[#D6C7A9]">
                {trayNotes.length === 0 ? (
                  <span className="text-xs sm:text-sm font-semibold text-[#64748B] text-center">
                    {lang === 'ar'
                      ? 'اضغط على الأوراق النقدية بالأسفل لوضعها هنا'
                      : 'Tap Egyptian banknotes below to place them on the counter'}
                  </span>
                ) : (
                  trayNotes.map((note, idx) => (
                    <button
                      key={`${note}-${idx}`}
                      type="button"
                      disabled={solved || isPaused}
                      onClick={() => {
                        if (isPaused || solved) return;
                        soundEngine.playClick();
                        setTrayNotes((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      title={lang === 'ar' ? 'اضغط للإزالة' : 'Tap to remove'}
                      className="transition-transform hover:scale-95 cursor-pointer"
                    >
                      <EgyptianBanknoteSvg denomination={note} lang={lang} compact />
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-0.5">
                {question.availableNotes.map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    disabled={solved || isPaused}
                    onClick={() => {
                      if (isPaused || solved) return;
                      soundEngine.playTapNote(trayNotes.length);
                      setTrayNotes((prev) => [...prev, denom]);
                    }}
                    className="rounded-xl p-1 hover:-translate-y-1 active:translate-y-0 transition-transform duration-150 cursor-pointer"
                  >
                    <EgyptianBanknoteSvg denomination={denom} lang={lang} compact />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {question.kind === 'money_change_or_compare' && (
          <div className="w-full max-w-2xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl flex items-center justify-around gap-3 sm:gap-4">
            <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-center flex-1">
              <div className="font-display text-xl sm:text-3xl font-bold text-[#78350F] tabular-nums">
                {t(question.leftLabel, lang)}
              </div>
            </div>

            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#E0F2FE] border-2 border-dashed border-[#0284C7] flex items-center justify-center font-display text-2xl sm:text-3xl font-bold text-[#0369A1] shrink-0">
              {solved
                ? question.subKind === 'compare'
                  ? question.answerCompare
                  : question.answerNumber
                : question.subKind === 'compare'
                ? '?'
                : '−'}
            </div>

            <div className="bg-[#CCFBF1] border-2 border-[#0D9488] rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-center flex-1">
              <div className="font-display text-xl sm:text-3xl font-bold text-[#115E59] tabular-nums">
                {t(question.rightLabel, lang)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone 3: Dedicated Mistake Explanation / Hint Strip (Never covers answers) */}
      {(wrongExplanation || showHint) && (
        <div className="relative z-10 px-3 sm:px-4 pb-1.5 flex justify-center shrink-0">
          <div className="w-full max-w-2xl bg-[#FFFDF7]/96 border-2 border-[#D97706] rounded-2xl px-3.5 py-2 shadow-sm flex items-start gap-2 text-xs sm:text-sm font-bold">
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

      {/* Zone 4: Bottom Answer Action Bar */}
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
              {question.kind === 'place_value' &&
                question.options.map((opt, idx) => {
                  const key = String(opt);
                  const isWrong = wrongKeys.includes(key);
                  const isCorrect = solved && opt === question.value;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isPaused || solved || isWrong}
                      onClick={() => handleNumberPick(opt, question.value)}
                      className={`relative min-w-[78px] sm:min-w-[96px] h-14 sm:h-16 px-4 sm:px-5 rounded-2xl font-display text-xl sm:text-3xl font-bold tabular-nums border-2 border-b-[5px] transition-transform duration-150 cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === key ? 'animate-gentle-shake' : ''}`}
                    >
                      <span>{opt}</span>
                      <span className="hidden sm:inline absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}

              {question.kind === 'money_build' && (
                <>
                  <button
                    type="button"
                    disabled={isPaused || solved}
                    onClick={() => {
                      if (isPaused || solved) return;
                      soundEngine.playClick();
                      setTrayNotes([]);
                    }}
                    className="h-14 px-5 rounded-2xl bg-[#FFFDF7] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t(UI_TEXT.clearTray, lang)}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isPaused || solved}
                    onClick={handleCheckMoney}
                    className={`h-14 px-7 rounded-2xl border-2 border-b-4 font-display text-lg sm:text-xl font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      solved
                        ? 'bg-[#16A34A] border-[#14532D] text-white'
                        : 'bg-[#F59E0B] hover:bg-[#D97706] border-[#133C3B] text-white'
                    } ${shakeKey === 'check-money' ? 'animate-gentle-shake' : ''}`}
                  >
                    <Check className="w-5 h-5" />
                    <span>{t(UI_TEXT.checkAnswer, lang)}</span>
                  </button>
                </>
              )}

              {question.kind === 'money_change_or_compare' &&
                question.subKind === 'compare' &&
                (
                  [
                    { sym: '<' as const, label: UI_TEXT.less },
                    { sym: '=' as const, label: UI_TEXT.equal },
                    { sym: '>' as const, label: UI_TEXT.greater },
                  ]
                ).map((btn, idx) => {
                  const isWrong = wrongKeys.includes(btn.sym);
                  const isCorrect = solved && btn.sym === question.answerCompare;
                  return (
                    <button
                      key={btn.sym}
                      type="button"
                      disabled={isPaused || solved || isWrong}
                      onClick={() => handleComparePick(btn.sym)}
                      className={`relative min-w-[96px] sm:min-w-[116px] h-14 sm:h-16 px-3.5 sm:px-4 rounded-2xl border-2 border-b-[5px] flex items-center justify-center gap-1.5 sm:gap-2 transition-transform cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === btn.sym ? 'animate-gentle-shake' : ''}`}
                    >
                      <span className="font-display text-2xl sm:text-3xl font-bold">{btn.sym}</span>
                      <span className="text-xs sm:text-sm font-bold">{t(btn.label, lang)}</span>
                      <span className="hidden sm:inline absolute top-1.5 right-2 text-[11px] font-bold text-[#64748B]">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}

              {question.kind === 'money_change_or_compare' &&
                question.subKind === 'change' &&
                question.optionsNumber?.map((opt, idx) => {
                  const key = String(opt);
                  const isWrong = wrongKeys.includes(key);
                  const isCorrect = solved && opt === question.answerNumber;
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={isPaused || solved || isWrong}
                      onClick={() =>
                        question.answerNumber !== undefined &&
                        handleNumberPick(opt, question.answerNumber)
                      }
                      className={`relative min-w-[84px] sm:min-w-[100px] h-14 sm:h-16 px-3.5 sm:px-5 rounded-2xl font-display text-lg sm:text-2xl font-bold tabular-nums border-2 border-b-[5px] transition-transform cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === key ? 'animate-gentle-shake' : ''}`}
                    >
                      <span>
                        {opt} {t(UI_TEXT.leUnit, lang)}
                      </span>
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
