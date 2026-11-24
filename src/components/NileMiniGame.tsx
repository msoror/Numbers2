import React, { useEffect, useRef, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { Language, NileQuestion } from '../types/game';
import { soundEngine } from '../utils/sound';

interface NileMiniGameProps {
  question: NileQuestion;
  lang: Language;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: () => void;
}

export const NileMiniGame: React.FC<NileMiniGameProps> = ({
  question,
  lang,
  onAttempt,
  onAdvance,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showRegroup, setShowRegroup] = useState(false);
  const [tappedRows, setTappedRows] = useState<number[]>([]);
  const [wrongOpts, setWrongOpts] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [shakeVal, setShakeVal] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowHint(false);
    setShowRegroup(false);
    setTappedRows([]);
    setWrongOpts([]);
    setSolved(false);
    setShakeVal(null);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question.id]);

  const handleChoose = (val: number) => {
    if (solved || wrongOpts.includes(val)) return;
    if (val === question.answer) {
      setSolved(true);
      soundEngine.playCorrect();
      onAttempt(true);
      timerRef.current = setTimeout(() => onAdvance(), 950);
    } else {
      soundEngine.playGentleMiss();
      setWrongOpts((prev) => [...prev, val]);
      setShakeVal(val);
      setShowHint(true);
      if (question.kind === 'vertical_math' && question.needsRegroup) {
        setShowRegroup(true);
      }
      onAttempt(false);
      setTimeout(() => setShakeVal(null), 260);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (solved) return;
      if (e.key >= '1' && e.key <= '4') {
        const val = question.options[Number(e.key) - 1];
        if (val !== undefined) handleChoose(val);
      } else if (e.key.toLowerCase() === 'h') {
        soundEngine.playClick();
        setShowHint((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const pad3 = (n: number) => {
    const h = Math.floor(n / 100);
    const tens = Math.floor((n % 100) / 10);
    const ones = n % 10;
    return { h, tens, ones };
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Nile River Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#93C5FD] via-[#38BDF8] to-[#0284C7]"
        aria-hidden="true"
      >
        <img
          src="/src/assets/images/egypt_nile_bg_1794872911846.jpg"
          alt="Sunny Nile River with date palms"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" />
      </div>

      {/* Top Prompt */}
      <div className="relative z-10 pt-16 px-4 flex justify-center">
        <div className="bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl px-6 py-3 shadow-md text-center max-w-2xl">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#133C3B]">
            {t(question.prompt, lang)}
          </h2>
          {showHint && (
            <p className="mt-1 text-sm font-bold text-[#0F766E]">
              {t(question.hint, lang)}
            </p>
          )}
        </div>
      </div>

      {/* Center Stage */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">
        {question.kind === 'vertical_math' ? (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center gap-4 min-w-[290px] sm:min-w-[340px]">
            {/* Strict LTR Vertical Place-Value Columns */}
            <div dir="ltr" className="grid grid-cols-4 gap-2 text-center items-center tabular-nums">
              {(() => {
                const topD = pad3(question.top);
                const botD = pad3(question.bottom);
                const hasHundreds = topD.h > 0 || botD.h > 0 || question.answer >= 100;
                const carryOnes =
                  question.operator === '+' && topD.ones + botD.ones >= 10 ? 1 : 0;
                const borrowTens =
                  question.operator === '-' && topD.ones < botD.ones ? 1 : 0;

                return (
                  <>
                    {/* Column Headers */}
                    <div />
                    <div className="text-xs font-bold text-[#9A3412]">
                      {hasHundreds ? (lang === 'ar' ? 'م' : 'H') : ''}
                    </div>
                    <div className="text-xs font-bold text-[#0F766E]">
                      {lang === 'ar' ? 'ع' : 'T'}
                    </div>
                    <div className="text-xs font-bold text-[#B45309]">
                      {lang === 'ar' ? 'آ' : 'O'}
                    </div>

                    {/* Optional Regrouping Row */}
                    {showRegroup && question.needsRegroup && (
                      <>
                        <div />
                        <div className="text-sm font-bold text-[#DC2626]" />
                        <div className="text-sm font-bold text-[#DC2626]">
                          {carryOnes > 0 ? '+1' : borrowTens > 0 ? `${topD.tens - 1}` : ''}
                        </div>
                        <div className="text-sm font-bold text-[#DC2626]">
                          {borrowTens > 0 ? `${topD.ones + 10}` : ''}
                        </div>
                      </>
                    )}

                    {/* Top Number */}
                    <div />
                    <div className="font-display text-4xl font-bold text-[#133C3B] w-12">
                      {topD.h > 0 ? topD.h : ''}
                    </div>
                    <div className="font-display text-4xl font-bold text-[#133C3B] w-12">
                      {topD.tens}
                    </div>
                    <div className="font-display text-4xl font-bold text-[#133C3B] w-12">
                      {topD.ones}
                    </div>

                    {/* Operator + Bottom Number */}
                    <div className="font-display text-4xl font-bold text-[#D97706]">
                      {question.operator}
                    </div>
                    <div className="font-display text-4xl font-bold text-[#133C3B] w-12">
                      {botD.h > 0 ? botD.h : ''}
                    </div>
                    <div className="font-display text-4xl font-bold text-[#133C3B] w-12">
                      {botD.tens}
                    </div>
                    <div className="font-display text-4xl font-bold text-[#133C3B] w-12">
                      {botD.ones}
                    </div>

                    {/* Divider */}
                    <div className="col-span-4 h-1 bg-[#133C3B] rounded-full my-1" />

                    {/* Answer Row */}
                    <div className="font-display text-3xl font-bold text-[#0D9488]">=</div>
                    <div className="col-span-3 font-display text-4xl font-bold tracking-widest text-[#16A34A]">
                      {solved ? question.answer : '? ? ?'}
                    </div>
                  </>
                );
              })()}
            </div>

            {question.needsRegroup && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setShowRegroup((p) => !p);
                }}
                className="px-4 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#D97706] text-xs font-bold text-[#78350F] cursor-pointer"
              >
                {showRegroup ? t(UI_TEXT.hideRegroup, lang) : t(UI_TEXT.showRegroup, lang)}
              </button>
            )}
          </div>
        ) : (
          /* Date Palm Array Builder */
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center gap-3">
            <div dir="ltr" className="font-display text-2xl font-bold text-[#133C3B] tabular-nums">
              {question.rows} × {question.cols} = {solved ? question.answer : '?'}
            </div>

            <div className="flex flex-col gap-2">
              {Array.from({ length: question.rows }, (_, rIdx) => {
                const isRowActive = tappedRows.includes(rIdx);
                return (
                  <button
                    key={rIdx}
                    type="button"
                    onClick={() => {
                      soundEngine.playTapNote(rIdx);
                      setTappedRows((prev) =>
                        prev.includes(rIdx) ? prev : [...prev, rIdx]
                      );
                    }}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border-2 transition-colors cursor-pointer ${
                      isRowActive
                        ? 'bg-[#DCFCE7] border-[#16A34A]'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#0D9488]'
                    }`}
                  >
                    {Array.from({ length: question.cols }, (_, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D97706] border-2 border-[#78350F] shadow-xs"
                      />
                    ))}
                    <span className="text-xs font-bold text-[#475569] tabular-nums min-w-[28px]">
                      {isRowActive ? `+${question.cols}` : ''}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-semibold text-[#475569]">
              {lang === 'ar'
                ? 'اضغط على كل صف لعد التمر'
                : 'Tap each row to count the date groups!'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Options + Hint */}
      <div className="relative z-10 pb-6 px-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {question.options.map((opt, idx) => {
            const isWrong = wrongOpts.includes(opt);
            const isCorrect = solved && opt === question.answer;
            return (
              <button
                key={opt}
                type="button"
                disabled={solved || isWrong}
                onClick={() => handleChoose(opt)}
                className={`relative min-w-[96px] h-16 sm:h-[70px] px-5 rounded-2xl font-display text-2xl sm:text-3xl font-bold tabular-nums border-2 border-b-[5px] transition-transform duration-150 cursor-pointer ${
                  isCorrect
                    ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                    : isWrong
                    ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                    : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                } ${shakeVal === opt ? 'animate-gentle-shake' : ''}`}
              >
                <span>{opt}</span>
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
            className="h-16 sm:h-[70px] px-4 rounded-2xl bg-[#FEF9C3] border-2 border-b-[5px] border-[#A16207] text-[#713F12] font-bold text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Lightbulb className="w-5 h-5" />
            <span>{showHint ? t(UI_TEXT.hintOn, lang) : t(UI_TEXT.hint, lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
