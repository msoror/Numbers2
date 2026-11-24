import React, { useEffect, useRef, useState } from 'react';
import { Check, Lightbulb, RotateCcw } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { BazaarQuestion, Language } from '../types/game';
import { soundEngine } from '../utils/sound';
import { EgyptianBanknoteSvg } from './EgyptSvgs';

interface BazaarMiniGameProps {
  question: BazaarQuestion;
  lang: Language;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: () => void;
}

export const BazaarMiniGame: React.FC<BazaarMiniGameProps> = ({
  question,
  lang,
  onAttempt,
  onAdvance,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [trayNotes, setTrayNotes] = useState<number[]>([]);
  const [highlightedCol, setHighlightedCol] = useState<'h' | 't' | 'o' | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowHint(false);
    setSolved(false);
    setWrongKeys([]);
    setShakeKey(null);
    setTrayNotes([]);
    setHighlightedCol(null);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question.id]);

  const handleCorrect = () => {
    setSolved(true);
    soundEngine.playCorrect();
    onAttempt(true);
    timerRef.current = setTimeout(() => onAdvance(), 950);
  };

  const handleMiss = (key: string) => {
    soundEngine.playGentleMiss();
    setWrongKeys((prev) => [...prev, key]);
    setShakeKey(key);
    setShowHint(true);
    onAttempt(false);
    setTimeout(() => setShakeKey(null), 260);
  };

  const handleNumberPick = (val: number, expected: number) => {
    const key = String(val);
    if (solved || wrongKeys.includes(key)) return;
    if (val === expected) handleCorrect();
    else handleMiss(key);
  };

  const handleComparePick = (sym: '<' | '=' | '>') => {
    if (question.kind !== 'money_change_or_compare' || solved || wrongKeys.includes(sym)) return;
    if (sym === question.answerCompare) handleCorrect();
    else handleMiss(sym);
  };

  const traySum = trayNotes.reduce((s, n) => s + n, 0);

  const handleCheckMoney = () => {
    if (question.kind !== 'money_build' || solved) return;
    if (traySum === question.targetAmount) {
      handleCorrect();
    } else {
      handleMiss('check-money');
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

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Cairo Bazaar Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FDE68A] via-[#E5C185] to-[#B45309]"
        aria-hidden="true"
      >
        <img
          src="/src/assets/images/egypt_bazaar_bg_1794872910525.jpg"
          alt="Cairo bazaar merchant stall"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25" />
      </div>

      {/* Top Prompt Card */}
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

      {/* Center Interactive Bazaar Mat */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">
        {question.kind === 'place_value' && (
          <div
            dir="ltr"
            className="w-full max-w-3xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl grid grid-cols-3 gap-3 sm:gap-5"
          >
            {/* Hundreds Column */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapNote(0);
                setHighlightedCol('h');
              }}
              className={`rounded-2xl border-2 p-3 flex flex-col items-center justify-between gap-2 transition-transform cursor-pointer ${
                highlightedCol === 'h'
                  ? 'bg-[#FFEDD5] border-[#EA580C] scale-[1.02]'
                  : 'bg-[#FFF7ED] border-[#FDBA74]'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold text-[#9A3412]">
                {t(UI_TEXT.hundreds, lang)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[86px]">
                {Array.from({ length: question.hundreds }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-9 h-9 rounded-md bg-[#F97316] border-2 border-[#7C2D12] grid grid-cols-3 gap-px p-0.5"
                    aria-hidden="true"
                  >
                    {Array.from({ length: 9 }, (_, c) => (
                      <span key={c} className="bg-[#FED7AA]/70 rounded-[1px]" />
                    ))}
                  </div>
                ))}
              </div>
              <span className="font-display text-lg font-bold text-[#7C2D12] tabular-nums">
                {showHint || highlightedCol === 'h' ? question.hundreds * 100 : `${question.hundreds} × 100`}
              </span>
            </button>

            {/* Tens Column */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapNote(2);
                setHighlightedCol('t');
              }}
              className={`rounded-2xl border-2 p-3 flex flex-col items-center justify-between gap-2 transition-transform cursor-pointer ${
                highlightedCol === 't'
                  ? 'bg-[#CCFBF1] border-[#0D9488] scale-[1.02]'
                  : 'bg-[#F0FDFA] border-[#5EEAD4]'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold text-[#115E59]">
                {t(UI_TEXT.tens, lang)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1 min-h-[86px]">
                {Array.from({ length: question.tens }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 h-11 rounded-sm bg-[#14B8A6] border border-[#134E4A]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-display text-lg font-bold text-[#115E59] tabular-nums">
                {showHint || highlightedCol === 't' ? question.tens * 10 : `${question.tens} × 10`}
              </span>
            </button>

            {/* Ones Column */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playTapNote(4);
                setHighlightedCol('o');
              }}
              className={`rounded-2xl border-2 p-3 flex flex-col items-center justify-between gap-2 transition-transform cursor-pointer ${
                highlightedCol === 'o'
                  ? 'bg-[#FEF3C7] border-[#D97706] scale-[1.02]'
                  : 'bg-[#FEFCE8] border-[#FDE047]'
              }`}
            >
              <span className="text-xs sm:text-sm font-bold text-[#854D0E]">
                {t(UI_TEXT.ones, lang)}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-1.5 min-h-[86px] max-w-[110px]">
                {Array.from({ length: question.ones }, (_, idx) => (
                  <div
                    key={idx}
                    className="w-4 h-4 rounded-sm bg-[#F59E0B] border border-[#78350F]"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <span className="font-display text-lg font-bold text-[#854D0E] tabular-nums">
                {question.ones}
              </span>
            </button>
          </div>
        )}

        {question.kind === 'money_build' && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-3">
            {/* Merchant Counter Tray */}
            <div className="w-full bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
                <div className="font-display text-lg sm:text-xl font-bold text-[#133C3B] tabular-nums">
                  {t(UI_TEXT.target, lang)}: <span className="text-[#D97706]">{question.targetAmount} {t(UI_TEXT.leUnit, lang)}</span>
                </div>
                <div
                  className={`font-display text-lg sm:text-xl font-bold tabular-nums ${
                    traySum === question.targetAmount ? 'text-[#16A34A]' : 'text-[#0D9488]'
                  }`}
                >
                  {t(UI_TEXT.collected, lang)}: {traySum} {t(UI_TEXT.leUnit, lang)}
                </div>
              </div>

              {/* Placed Notes on Counter (tap to remove) */}
              <div className="min-h-[76px] flex flex-wrap items-center justify-center gap-2 bg-[#F7F1E3] rounded-2xl p-3 border border-[#D6C7A9]">
                {trayNotes.length === 0 ? (
                  <span className="text-sm font-semibold text-[#64748B]">
                    {lang === 'ar'
                      ? 'اضغط على الأوراق النقدية بالأسفل لوضعها هنا'
                      : 'Tap Egyptian banknotes below to place them on the counter'}
                  </span>
                ) : (
                  trayNotes.map((note, idx) => (
                    <button
                      key={`${note}-${idx}`}
                      type="button"
                      disabled={solved}
                      onClick={() => {
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

              {/* Wallet Banknote Picker */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {question.availableNotes.map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    disabled={solved}
                    onClick={() => {
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
          <div className="w-full max-w-2xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-6 shadow-xl flex items-center justify-around gap-4">
            <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-2xl px-5 py-4 text-center flex-1">
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#78350F] tabular-nums">
                {t(question.leftLabel, lang)}
              </div>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE] border-2 border-dashed border-[#0284C7] flex items-center justify-center font-display text-3xl font-bold text-[#0369A1] shrink-0">
              {solved
                ? question.subKind === 'compare'
                  ? question.answerCompare
                  : '?'
                : question.subKind === 'compare'
                ? '?'
                : '−'}
            </div>

            <div className="bg-[#CCFBF1] border-2 border-[#0D9488] rounded-2xl px-5 py-4 text-center flex-1">
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#115E59] tabular-nums">
                {t(question.rightLabel, lang)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Controls */}
      <div className="relative z-10 pb-6 px-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {question.kind === 'place_value' &&
            question.options.map((opt, idx) => {
              const key = String(opt);
              const isWrong = wrongKeys.includes(key);
              const isCorrect = solved && opt === question.value;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={solved || isWrong}
                  onClick={() => handleNumberPick(opt, question.value)}
                  className={`relative min-w-[96px] h-16 px-5 rounded-2xl font-display text-2xl sm:text-3xl font-bold tabular-nums border-2 border-b-[5px] transition-transform duration-150 cursor-pointer ${
                    isCorrect
                      ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                      : isWrong
                      ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                      : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                  } ${shakeKey === key ? 'animate-gentle-shake' : ''}`}
                >
                  <span>{opt}</span>
                  <span className="absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                    {idx + 1}
                  </span>
                </button>
              );
            })}

          {question.kind === 'money_build' && (
            <>
              <button
                type="button"
                disabled={solved}
                onClick={() => {
                  soundEngine.playClick();
                  setTrayNotes([]);
                }}
                className="h-14 px-5 rounded-2xl bg-[#FFFDF7] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t(UI_TEXT.clearTray, lang)}</span>
              </button>

              <button
                type="button"
                disabled={solved}
                onClick={handleCheckMoney}
                className={`h-14 px-7 rounded-2xl border-2 border-b-4 font-display text-xl font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
                  disabled={solved || isWrong}
                  onClick={() => handleComparePick(btn.sym)}
                  className={`relative min-w-[116px] h-16 px-4 rounded-2xl border-2 border-b-[5px] flex items-center justify-center gap-2 transition-transform cursor-pointer ${
                    isCorrect
                      ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                      : isWrong
                      ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                      : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                  } ${shakeKey === btn.sym ? 'animate-gentle-shake' : ''}`}
                >
                  <span className="font-display text-3xl font-bold">{btn.sym}</span>
                  <span className="text-sm font-bold">{t(btn.label, lang)}</span>
                  <span className="absolute top-1.5 right-2 text-[11px] font-bold text-[#64748B]">
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
                  disabled={solved || isWrong}
                  onClick={() =>
                    question.answerNumber !== undefined &&
                    handleNumberPick(opt, question.answerNumber)
                  }
                  className={`relative min-w-[100px] h-16 px-5 rounded-2xl font-display text-2xl font-bold tabular-nums border-2 border-b-[5px] transition-transform cursor-pointer ${
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
            className="h-14 sm:h-16 px-4 rounded-2xl bg-[#FEF9C3] border-2 border-b-[5px] border-[#A16207] text-[#713F12] font-bold text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Lightbulb className="w-5 h-5" />
            <span>{showHint ? t(UI_TEXT.hintOn, lang) : t(UI_TEXT.hint, lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
