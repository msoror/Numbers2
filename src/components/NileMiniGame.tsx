import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { usePausableTimer } from '../hooks/usePausableTimer';
import { BilingualText, Language, NileQuestion, RoundAdvancePayload } from '../types/game';
import egyptNileBg from '../assets/images/egypt_nile_bg.webp';
import { computeRegroupingPlan } from '../utils/regrouping';
import { soundEngine } from '../utils/sound';
import { ReadAloudButton } from './ReadAloudButton';

interface NileMiniGameProps {
  question: NileQuestion;
  lang: Language;
  isPaused: boolean;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: (result: RoundAdvancePayload) => void;
}

function buildNileWrongExplanation(question: NileQuestion, chosen: number): BilingualText {
  if (question.kind === 'vertical_math') {
    const opWord = question.operator === '+' ? '+' : '−';
    const onesTop = question.top % 10;
    const onesBot = question.bottom % 10;
    const expectedOnes =
      question.operator === '+' ? (onesTop + onesBot) % 10 : (onesTop - onesBot + 10) % 10;
    const chosenOnes = chosen % 10;
    if (chosenOnes !== expectedOnes) {
      return {
        en: `${chosen} ends in ${chosenOnes}, but the Ones column (${onesTop} ${opWord} ${onesBot}) should end in ${expectedOnes}. Check the regrouping steps above!`,
        ar: `${chosen} ينتهي بـ ${chosenOnes}، لكن خانة الآحاد (${onesTop} ${opWord} ${onesBot}) يجب أن تنتهي بـ ${expectedOnes}. راجع خطوات إعادة التجميع بالأعلى!`,
      };
    }
    return {
      en: `${chosen} is close, but check the Tens and Hundreds regrouping steps carefully!`,
      ar: `${chosen} قريب جدًا، لكن راجع خطوات إعادة التجميع في العشرات والمئات بعناية!`,
    };
  }

  return {
    en: `${chosen} is not ${question.rows} groups of ${question.cols}. Tap each row to skip-count by ${question.cols}!`,
    ar: `${chosen} ليس ${question.rows} صفوف في كل منها ${question.cols}. اضغط على كل صف للعد بالقفز بمقدار ${question.cols}!`,
  };
}

export const NileMiniGame: React.FC<NileMiniGameProps> = ({
  question,
  lang,
  isPaused,
  onAttempt,
  onAdvance,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showRegroup, setShowRegroup] = useState(false);
  const [regroupStepIdx, setRegroupStepIdx] = useState(0);
  const [tappedRows, setTappedRows] = useState<number[]>([]);
  const [wrongOpts, setWrongOpts] = useState<number[]>([]);
  const [hadMistake, setHadMistake] = useState(false);
  const [wrongExplanation, setWrongExplanation] = useState<BilingualText | null>(null);
  const [solved, setSolved] = useState(false);
  const [shakeVal, setShakeVal] = useState<number | null>(null);

  const { schedule, cancel } = usePausableTimer(isPaused);

  const regroupPlan = useMemo(() => {
    if (question.kind !== 'vertical_math') return null;
    return computeRegroupingPlan(question.operator, question.top, question.bottom);
  }, [question]);

  useEffect(() => {
    cancel();
    setShowHint(false);
    setShowRegroup(false);
    setRegroupStepIdx(0);
    setTappedRows([]);
    setWrongOpts([]);
    setHadMistake(false);
    setWrongExplanation(null);
    setSolved(false);
    setShakeVal(null);
  }, [question.id, cancel]);

  const handleChoose = (val: number) => {
    if (isPaused || solved || wrongOpts.includes(val)) return;
    if (val === question.answer) {
      setSolved(true);
      soundEngine.playCorrect();
      onAttempt(true);
      if (!hadMistake) {
        schedule(() => onAdvance({ correctFirstTry: true }), 950);
      }
    } else {
      soundEngine.playGentleMiss();
      setHadMistake(true);
      setWrongOpts((prev) => [...prev, val]);
      setWrongExplanation(buildNileWrongExplanation(question, val));
      setShakeVal(val);
      setShowHint(true);
      if (question.kind === 'vertical_math' && question.needsRegroup) {
        setShowRegroup(true);
      }
      onAttempt(false);
      setTimeout(() => setShakeVal(null), 260);
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

  const needsManualNext = solved && hadMistake;
  const activeStep =
    regroupPlan && showRegroup
      ? regroupPlan.steps[Math.min(regroupStepIdx, regroupPlan.steps.length - 1)]
      : null;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Nile River Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#93C5FD] via-[#38BDF8] to-[#0284C7]"
        aria-hidden="true"
      >
        <img
          src={egyptNileBg}
          alt=""
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/20" />
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
        {question.kind === 'vertical_math' && regroupPlan ? (
          <div
            role="group"
            aria-label={
              lang === 'ar'
                ? `مسألة رأسية: ${question.top} ${question.operator === '+' ? 'زائد' : 'ناقص'} ${question.bottom}`
                : `Vertical problem: ${question.top} ${question.operator === '+' ? 'plus' : 'minus'} ${question.bottom}`
            }
            className="bg-[#FFFDF7]/96 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center gap-3 w-full max-w-md"
          >
            {/* Strict LTR Vertical Place-Value Columns */}
            <div dir="ltr" className="grid grid-cols-4 gap-2 text-center items-center tabular-nums">
              {/* Column Headers */}
              <div />
              <div
                className={`text-xs font-bold rounded-md py-0.5 ${
                  activeStep?.highlightCols.includes('h')
                    ? 'bg-[#FFEDD5] text-[#9A3412]'
                    : 'text-[#9A3412]'
                }`}
              >
                {regroupPlan.hasHundreds ? (lang === 'ar' ? 'م' : 'H') : ''}
              </div>
              <div
                className={`text-xs font-bold rounded-md py-0.5 ${
                  activeStep?.highlightCols.includes('t')
                    ? 'bg-[#CCFBF1] text-[#0F766E]'
                    : 'text-[#0F766E]'
                }`}
              >
                {lang === 'ar' ? 'ع' : 'T'}
              </div>
              <div
                className={`text-xs font-bold rounded-md py-0.5 ${
                  activeStep?.highlightCols.includes('o')
                    ? 'bg-[#FEF3C7] text-[#B45309]'
                    : 'text-[#B45309]'
                }`}
              >
                {lang === 'ar' ? 'آ' : 'O'}
              </div>

              {/* Step-by-Step Regrouping Row (Hundreds, Tens, Ones all supported!) */}
              {activeStep && (
                <>
                  <div className="text-[11px] font-bold text-[#DC2626]">
                    {regroupPlan.operator === '+' ? '+' : '↺'}
                  </div>

                  {/* Hundreds Regrouped Cell */}
                  <div className="min-h-[26px] flex items-center justify-center">
                    {activeStep.hundredsAnnotation && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626] font-display text-sm sm:text-base font-bold text-[#B91C1C]">
                        {activeStep.hundredsAnnotation}
                      </span>
                    )}
                  </div>

                  {/* Tens Regrouped Cell (supports intermediate crossed digit when borrowing across 0 or double borrow!) */}
                  <div className="min-h-[26px] flex items-center justify-center gap-1">
                    {activeStep.intermediateTensCrossed && (
                      <span className="text-xs font-bold text-[#94A3B8] line-through">
                        {activeStep.intermediateTensCrossed}
                      </span>
                    )}
                    {activeStep.tensAnnotation && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626] font-display text-sm sm:text-base font-bold text-[#B91C1C]">
                        {activeStep.tensAnnotation}
                      </span>
                    )}
                  </div>

                  {/* Ones Regrouped Cell */}
                  <div className="min-h-[26px] flex items-center justify-center">
                    {activeStep.onesAnnotation && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-[#FEE2E2] border border-[#DC2626] font-display text-sm sm:text-base font-bold text-[#B91C1C]">
                        {activeStep.onesAnnotation}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* Top Number */}
              <div />
              <div
                className={`font-display text-3xl sm:text-4xl font-bold w-12 transition-opacity ${
                  activeStep?.crossed.hundreds
                    ? 'text-[#94A3B8] line-through decoration-2 decoration-[#DC2626]'
                    : 'text-[#133C3B]'
                }`}
              >
                {regroupPlan.top.h > 0 ? regroupPlan.top.h : ''}
              </div>
              <div
                className={`font-display text-3xl sm:text-4xl font-bold w-12 transition-opacity ${
                  activeStep?.crossed.tens
                    ? 'text-[#94A3B8] line-through decoration-2 decoration-[#DC2626]'
                    : 'text-[#133C3B]'
                }`}
              >
                {regroupPlan.top.t}
              </div>
              <div
                className={`font-display text-3xl sm:text-4xl font-bold w-12 transition-opacity ${
                  activeStep?.crossed.ones
                    ? 'text-[#94A3B8] line-through decoration-2 decoration-[#DC2626]'
                    : 'text-[#133C3B]'
                }`}
              >
                {regroupPlan.top.o}
              </div>

              {/* Operator + Bottom Number */}
              <div className="font-display text-3xl sm:text-4xl font-bold text-[#D97706]">
                {question.operator}
              </div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-[#133C3B] w-12">
                {regroupPlan.bottom.h > 0 ? regroupPlan.bottom.h : ''}
              </div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-[#133C3B] w-12">
                {regroupPlan.bottom.t}
              </div>
              <div className="font-display text-3xl sm:text-4xl font-bold text-[#133C3B] w-12">
                {regroupPlan.bottom.o}
              </div>

              {/* Divider */}
              <div className="col-span-4 h-1 bg-[#133C3B] rounded-full my-0.5" />

              {/* Answer Row */}
              <div className="font-display text-2xl sm:text-3xl font-bold text-[#0D9488]">=</div>
              <div className="col-span-3 font-display text-3xl sm:text-4xl font-bold tracking-widest text-[#16A34A]">
                {solved ? question.answer : '? ? ?'}
              </div>
            </div>

            {/* Interactive Step-by-Step Regrouping Walkthrough */}
            {question.needsRegroup && (
              <div className="w-full flex flex-col items-center gap-2 pt-1 border-t border-[#133C3B]/10">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={isPaused}
                    onClick={() => {
                      if (isPaused) return;
                      soundEngine.playClick();
                      setShowRegroup((p) => {
                        if (!p) setRegroupStepIdx(0);
                        return !p;
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FEF3C7] border border-[#D97706] text-xs font-bold text-[#78350F] cursor-pointer whitespace-nowrap"
                  >
                    {showRegroup ? t(UI_TEXT.hideRegroup, lang) : t(UI_TEXT.showRegroup, lang)}
                  </button>

                  {showRegroup && regroupPlan.steps.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isPaused || regroupStepIdx === 0}
                        onClick={() => {
                          if (isPaused) return;
                          soundEngine.playClick();
                          setRegroupStepIdx((i) => Math.max(0, i - 1));
                        }}
                        aria-label={t(UI_TEXT.regroupPrevBtn, lang)}
                        className="h-8 px-2 rounded-lg bg-white border border-[#133C3B]/25 text-[#133C3B] disabled:opacity-40 cursor-pointer flex items-center"
                      >
                        <ChevronLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                      </button>
                      <span className="text-xs font-bold text-[#133C3B] tabular-nums px-1.5 whitespace-nowrap">
                        {t(UI_TEXT.stepLabel, lang)} {regroupStepIdx + 1}/{regroupPlan.steps.length}
                      </span>
                      <button
                        type="button"
                        disabled={isPaused || regroupStepIdx >= regroupPlan.steps.length - 1}
                        onClick={() => {
                          if (isPaused) return;
                          soundEngine.playClick();
                          setRegroupStepIdx((i) => Math.min(regroupPlan.steps.length - 1, i + 1));
                        }}
                        aria-label={t(UI_TEXT.regroupStepBtn, lang)}
                        className="h-8 px-2 rounded-lg bg-white border border-[#133C3B]/25 text-[#133C3B] disabled:opacity-40 cursor-pointer flex items-center"
                      >
                        <ChevronRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>

                {activeStep && (
                  <p className="text-xs sm:text-sm font-semibold text-[#133C3B] bg-[#FFF7ED] border border-[#FDBA74] rounded-xl px-3 py-2 text-center leading-snug w-full">
                    {t(activeStep.explanation, lang)}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Date Palm Array Builder */
          question.kind === 'array_multiply' && (
            <div
              role="group"
              aria-label={
                lang === 'ar'
                  ? `مصفوفة من ${question.rows} صفوف، في كل صف ${question.cols} تمرات`
                  : `Array of ${question.rows} rows with ${question.cols} dates in each row`
              }
              className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col items-center gap-3"
            >
              <div dir="ltr" className="font-display text-xl sm:text-2xl font-bold text-[#133C3B] tabular-nums">
                {question.rows} × {question.cols} = {solved ? question.answer : '?'}
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                {Array.from({ length: question.rows }, (_, rIdx) => {
                  const isRowActive = tappedRows.includes(rIdx);
                  return (
                    <button
                      key={rIdx}
                      type="button"
                      disabled={isPaused}
                      onClick={() => {
                        if (isPaused) return;
                        soundEngine.playTapNote(rIdx);
                        setTappedRows((prev) =>
                          prev.includes(rIdx) ? prev : [...prev, rIdx]
                        );
                      }}
                      className={`flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-2xl border-2 transition-colors cursor-pointer ${
                        isRowActive
                          ? 'bg-[#DCFCE7] border-[#16A34A]'
                          : 'bg-[#F8FAFC] border-[#CBD5E1] hover:border-[#0D9488]'
                      }`}
                    >
                      {Array.from({ length: question.cols }, (_, cIdx) => (
                        <div
                          key={cIdx}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#D97706] border-2 border-[#78350F] shadow-xs"
                        />
                      ))}
                      <span className="text-xs font-bold text-[#475569] tabular-nums min-w-[26px]">
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
          )
        )}
      </div>

      {/* Zone 3: Dedicated Mistake Explanation / Hint Strip */}
      {(wrongExplanation || showHint) && (
        <div className="relative z-10 px-3 sm:px-4 pb-1.5 flex justify-center shrink-0">
          <div className="w-full max-w-2xl bg-[#FFFDF7]/96 border-2 border-[#0F766E] rounded-2xl px-3.5 py-2 shadow-sm flex items-start gap-2 text-xs sm:text-sm font-bold">
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
                <Lightbulb className="w-4 h-4 text-[#0F766E] shrink-0 mt-0.5" />
                <span className="text-[#0F766E] leading-snug">{t(question.hint, lang)}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Zone 4: Bottom Answer Action Bar */}
      <div className="relative z-10 pb-4 sm:pb-6 px-3 sm:px-4 flex justify-center shrink-0">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3.5 max-w-3xl">
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
              {question.options.map((opt, idx) => {
                const isWrong = wrongOpts.includes(opt);
                const isCorrect = solved && opt === question.answer;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isPaused || solved || isWrong}
                    onClick={() => handleChoose(opt)}
                    className={`relative min-w-[78px] sm:min-w-[96px] h-14 sm:h-[68px] px-4 sm:px-5 rounded-2xl font-display text-xl sm:text-3xl font-bold tabular-nums border-2 border-b-[5px] transition-transform duration-150 cursor-pointer ${
                      isCorrect
                        ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                        : isWrong
                        ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                        : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                    } ${shakeVal === opt ? 'animate-gentle-shake' : ''}`}
                  >
                    <span>{opt}</span>
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
                className="h-14 sm:h-[68px] px-3.5 sm:px-4 rounded-2xl bg-[#FEF9C3] border-2 border-b-[5px] border-[#A16207] text-[#713F12] font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
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
