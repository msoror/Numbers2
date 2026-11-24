import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Droplets, Lightbulb, RotateCcw } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { usePausableTimer } from '../hooks/usePausableTimer';
import { BilingualText, Language, RoundAdvancePayload, WorkshopQuestion } from '../types/game';
import { soundEngine } from '../utils/sound';
import { EgyptShapeSvg, FractionCircleSvg } from './EgyptSvgs';

interface WorkshopMeasureMiniGameProps {
  question: WorkshopQuestion;
  lang: Language;
  isPaused: boolean;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: (result: RoundAdvancePayload) => void;
}

function buildWorkshopWrongExplanation(
  question: WorkshopQuestion,
  chosenLabel?: string | number,
  pouredMl?: number
): BilingualText {
  if (question.kind === 'capacity_pour') {
    const cur = pouredMl ?? 0;
    const diff = Math.abs(question.targetMl - cur);
    if (cur < question.targetMl) {
      return {
        en: `You poured ${cur} mL, which is ${diff} mL below the ${question.targetMl} mL line. Add another scoop!`,
        ar: `سكبت ${cur} مل، وينقصك ${diff} مل للوصول إلى ${question.targetMl} مل. أضف كوبًا آخر!`,
      };
    }
    return {
      en: `You poured ${cur} mL, which is ${diff} mL above ${question.targetMl} mL. Tap Clear and try again!`,
      ar: `سكبت ${cur} مل، وهو أكثر بـ ${diff} مل من ${question.targetMl} مل. اضغط مسح وحاول مرة أخرى!`,
    };
  }
  if (question.kind === 'measure_length') {
    const endCm = question.startCm + question.lengthCm;
    return {
      en: `Not ${chosenLabel} cm — the object starts at ${question.startCm} cm and ends at ${endCm} cm (${endCm} − ${question.startCm}).`,
      ar: `ليس ${chosenLabel} سم — يبدأ الجسم عند ${question.startCm} سم وينتهي عند ${endCm} سم (${endCm} − ${question.startCm}).`,
    };
  }
  return question.hint;
}

export const WorkshopMeasureMiniGame: React.FC<WorkshopMeasureMiniGameProps> = ({
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
  const [pouredMl, setPouredMl] = useState(0);

  const { schedule, cancel } = usePausableTimer(isPaused);

  useEffect(() => {
    cancel();
    setShowHint(false);
    setSolved(false);
    setHadMistake(false);
    setWrongExplanation(null);
    setWrongKeys([]);
    setShakeKey(null);
    setPouredMl(0);
  }, [question.id, cancel]);

  const triggerWin = () => {
    if (isPaused || solved) return;
    setSolved(true);
    soundEngine.playCorrect();
    onAttempt(true);
    if (!hadMistake) {
      schedule(() => onAdvance({ correctFirstTry: true }), 950);
    }
  };

  const triggerMiss = (key: string, chosenLabel?: string | number, currentPoured?: number) => {
    if (isPaused || solved) return;
    soundEngine.playGentleMiss();
    setHadMistake(true);
    if (key !== 'check-cap') {
      setWrongKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
    }
    setWrongExplanation(buildWorkshopWrongExplanation(question, chosenLabel, currentPoured));
    setShakeKey(key);
    setShowHint(true);
    onAttempt(false);
    setTimeout(() => setShakeKey(null), 260);
  };

  const handleCheckCapacity = () => {
    if (isPaused || question.kind !== 'capacity_pour' || solved) return;
    if (pouredMl === question.targetMl) triggerWin();
    else triggerMiss('check-cap', pouredMl, pouredMl);
  };

  const handleLengthPick = (cm: number) => {
    if (isPaused || question.kind !== 'measure_length' || solved || wrongKeys.includes(String(cm))) {
      return;
    }
    if (cm === question.lengthCm) triggerWin();
    else triggerMiss(String(cm), cm);
  };

  const handleIndexPick = (idx: number, correctIndex: number) => {
    const key = `idx-${idx}`;
    if (isPaused || solved || wrongKeys.includes(key)) return;
    if (idx === correctIndex) triggerWin();
    else triggerMiss(key);
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
      if (question.kind === 'capacity_pour' && e.key === 'Enter') {
        handleCheckCapacity();
      } else if (question.kind === 'measure_length' && e.key >= '1' && e.key <= '4') {
        const val = question.options[Number(e.key) - 1];
        if (val !== undefined) handleLengthPick(val);
      } else if (
        (question.kind === 'mass_or_unit' || question.kind === 'fraction_or_shape') &&
        e.key >= '1' &&
        e.key <= '4'
      ) {
        const idx = Number(e.key) - 1;
        if (question.options[idx] !== undefined) {
          handleIndexPick(idx, question.correctIndex);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const needsManualNext = solved && hadMistake;

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Pyramid Workshop Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FDE68A] via-[#F5D0A9] to-[#A16207]"
        aria-hidden="true"
      >
        <img
          src="/src/assets/images/egypt_workshop_bg_1794872912622.jpg"
          alt="Sunlit Egyptian artisan measurement workshop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25" />
      </div>

      {/* Zone 1: Top Prompt */}
      <div className="relative z-10 pt-16 sm:pt-17 px-3 sm:px-4 flex justify-center shrink-0">
        <div className="bg-[#FFFDF7] border-2 border-[#133C3B] rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-md text-center max-w-2xl w-full">
          <h2 className="font-display text-lg sm:text-2xl font-bold text-[#133C3B] leading-snug">
            {t(question.prompt, lang)}
          </h2>
        </div>
      </div>

      {/* Zone 2: Scroll-Safe Interactive Workshop Stage */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-3 sm:px-4 py-2">
        {/* 1. LIQUID CAPACITY POURING BEAKER */}
        {question.kind === 'capacity_pour' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-7">
            <div className="flex items-end gap-3.5">
              <div className="relative w-28 sm:w-32 h-44 sm:h-52 rounded-b-3xl rounded-t-lg border-4 border-[#133C3B] bg-[#F8FAFC] overflow-hidden flex flex-col justify-end">
                <div
                  className={`w-full transition-all duration-300 ${
                    pouredMl > question.targetMl
                      ? 'bg-[#EF4444]/80'
                      : pouredMl === question.targetMl
                      ? 'bg-[#0D9488]'
                      : 'bg-[#38BDF8]'
                  }`}
                  style={{ height: `${Math.min(100, (pouredMl / question.maxMl) * 100)}%` }}
                />
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-[#D97706] pointer-events-none"
                  style={{ bottom: `${(question.targetMl / question.maxMl) * 100}%` }}
                />
                {[0.25, 0.5, 0.75, 1].map((frac) => {
                  const mark = Math.round(question.maxMl * frac);
                  return (
                    <div
                      key={mark}
                      dir="ltr"
                      className="absolute left-1.5 text-[11px] font-bold text-[#133C3B] tabular-nums pointer-events-none"
                      style={{ bottom: `calc(${frac * 100}% - 8px)` }}
                    >
                      — {mark}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1 text-left">
                <div className="text-xs font-bold text-[#64748B]">{t(UI_TEXT.target, lang)}</div>
                <div dir="ltr" className="font-display text-xl sm:text-2xl font-bold text-[#D97706] tabular-nums">
                  {question.targetMl} {t(UI_TEXT.mlShort, lang)}
                </div>
                <div className="text-xs font-bold text-[#64748B] mt-2">{t(UI_TEXT.collected, lang)}</div>
                <div dir="ltr" className="font-display text-xl sm:text-2xl font-bold text-[#0284C7] tabular-nums">
                  {pouredMl} {t(UI_TEXT.mlShort, lang)}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-bold text-[#475569]">
                {lang === 'ar' ? 'اضغط لسكب الماء' : 'Tap scoops to pour'}
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-[240px]">
                {question.scoops.map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    disabled={isPaused || solved || pouredMl >= question.maxMl}
                    onClick={() => {
                      if (isPaused || solved) return;
                      soundEngine.playHop();
                      setPouredMl((prev) => Math.min(question.maxMl, prev + ml));
                    }}
                    dir="ltr"
                    className="h-12 sm:h-14 px-3.5 sm:px-4 rounded-2xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border-2 border-b-4 border-[#0284C7] text-[#0C4A6E] font-display text-base sm:text-lg font-bold flex items-center gap-1.5 cursor-pointer tabular-nums"
                  >
                    <Droplets className="w-4 h-4 text-[#0284C7]" />
                    <span>+{ml} mL</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. CENTIMETER RULER MEASUREMENT */}
        {question.kind === 'measure_length' && (
          <div
            dir="ltr"
            className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-7 shadow-xl w-full max-w-3xl flex flex-col gap-4"
          >
            <div className="relative h-12 sm:h-14 w-full">
              <div
                className="absolute bottom-0 h-10 sm:h-11 rounded-xl border-2 border-[#133C3B] flex items-center justify-center text-white font-display font-bold text-xs sm:text-base shadow-sm px-2 truncate"
                style={{
                  backgroundColor: question.objectColor,
                  left: `${(question.startCm / question.maxCm) * 100}%`,
                  width: `${(question.lengthCm / question.maxCm) * 100}%`,
                }}
              >
                {t(question.objectName, lang)}
              </div>
            </div>

            <div className="relative w-full h-14 bg-[#FDE68A] border-2 border-[#78350F] rounded-xl flex items-start">
              {Array.from({ length: question.maxCm + 1 }, (_, cm) => (
                <div
                  key={cm}
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${(cm / question.maxCm) * 100}%` }}
                >
                  <div className="w-0.5 h-4 bg-[#78350F]" />
                  <span className="text-[10px] sm:text-sm font-bold text-[#451A03] tabular-nums mt-1">
                    {cm}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center text-xs font-bold text-[#78350F]">
              {lang === 'ar' ? 'المسطرة بالسنتيمتر (سم)' : 'Centimeter Ruler (cm)'}
            </div>
          </div>
        )}

        {/* 3. MASS / UNIT COMPARISON SCALE */}
        {question.kind === 'mass_or_unit' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-xl w-full max-w-2xl flex flex-col items-center gap-3.5">
            <div
              className="w-full flex items-end justify-around gap-3 sm:gap-4 transition-transform duration-300"
              style={{
                transform: `rotate(${
                  question.leftWeightGrams > question.rightWeightGrams
                    ? -6
                    : question.leftWeightGrams < question.rightWeightGrams
                    ? 6
                    : 0
                }deg)`,
              }}
            >
              <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-center flex-1">
                <div className="font-display text-base sm:text-xl font-bold text-[#78350F]">
                  {t(question.leftLabel, lang)}
                </div>
              </div>
              <div className="bg-[#E0F2FE] border-2 border-[#0284C7] rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-center flex-1">
                <div className="font-display text-base sm:text-xl font-bold text-[#0C4A6E]">
                  {t(question.rightLabel, lang)}
                </div>
              </div>
            </div>
            <div className="w-3/4 h-3 bg-[#78350F] rounded-full" aria-hidden="true" />
            <div
              className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-b-[24px] border-b-[#133C3B]"
              aria-hidden="true"
            />
          </div>
        )}

        {/* 4. FRACTIONS, 2D/3D SHAPES, OR BAR GRAPH */}
        {question.kind === 'fraction_or_shape' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center gap-3 min-w-[260px]">
            {question.subKind === 'fraction' &&
              question.fractionTotalParts &&
              question.fractionShadedParts && (
                <FractionCircleSvg
                  totalParts={question.fractionTotalParts}
                  shadedParts={question.fractionShadedParts}
                  size={156}
                />
              )}

            {question.subKind === 'shape' && question.shape && (
              <EgyptShapeSvg shape={question.shape} size={144} showVertices={showHint} />
            )}

            {question.subKind === 'graph' && question.graphBars && (() => {
              const maxBar = Math.max(...question.graphBars.map((b) => b.count), 1);
              return (
                <div className="flex items-end justify-center gap-4 sm:gap-6 h-44 sm:h-48 px-3 sm:px-4 pt-4 border-b-2 border-[#133C3B]">
                  {question.graphBars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="font-display text-base sm:text-lg font-bold text-[#133C3B] tabular-nums">
                        {bar.count}
                      </span>
                      <div
                        className="w-11 sm:w-14 rounded-t-xl border-2 border-[#133C3B]"
                        style={{
                          height: `${Math.max(18, Math.round((bar.count / maxBar) * 104))}px`,
                          backgroundColor: bar.color,
                        }}
                      />
                      <span className="text-xs font-bold text-[#133C3B]">{t(bar.label, lang)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Zone 3: Dedicated Mistake Explanation / Hint Strip */}
      {(wrongExplanation || showHint) && (
        <div className="relative z-10 px-3 sm:px-4 pb-1.5 flex justify-center shrink-0">
          <div className="w-full max-w-2xl bg-[#FFFDF7]/96 border-2 border-[#A16207] rounded-2xl px-3.5 py-2 shadow-sm flex items-start gap-2 text-xs sm:text-sm font-bold">
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

      {/* Zone 4: Bottom Choice Bar */}
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
              {question.kind === 'capacity_pour' && (
                <>
                  <button
                    type="button"
                    disabled={isPaused || solved}
                    onClick={() => {
                      if (isPaused || solved) return;
                      soundEngine.playClick();
                      setPouredMl(0);
                    }}
                    className="h-14 px-5 rounded-2xl bg-[#FFFDF7] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t(UI_TEXT.clearTray, lang)}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPaused || solved}
                    onClick={handleCheckCapacity}
                    className={`h-14 px-7 rounded-2xl border-2 border-b-4 font-display text-lg sm:text-xl font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                      solved
                        ? 'bg-[#16A34A] border-[#14532D] text-white'
                        : 'bg-[#0D9488] hover:bg-[#0F766E] border-[#133C3B] text-white'
                    } ${shakeKey === 'check-cap' ? 'animate-gentle-shake' : ''}`}
                  >
                    <Check className="w-5 h-5" />
                    <span>{t(UI_TEXT.checkAnswer, lang)}</span>
                  </button>
                </>
              )}

              {question.kind === 'measure_length' &&
                question.options.map((cm, idx) => {
                  const key = String(cm);
                  const isWrong = wrongKeys.includes(key);
                  const isCorrect = solved && cm === question.lengthCm;
                  return (
                    <button
                      key={cm}
                      type="button"
                      disabled={isPaused || solved || isWrong}
                      onClick={() => handleLengthPick(cm)}
                      className={`relative min-w-[82px] sm:min-w-[100px] h-14 sm:h-16 px-4 sm:px-5 rounded-2xl font-display text-lg sm:text-2xl font-bold tabular-nums border-2 border-b-[5px] transition-transform cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === key ? 'animate-gentle-shake' : ''}`}
                    >
                      <span>
                        {cm} {t(UI_TEXT.cmShort, lang)}
                      </span>
                      <span className="hidden sm:inline absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}

              {(question.kind === 'mass_or_unit' || question.kind === 'fraction_or_shape') &&
                question.options.map((opt, idx) => {
                  const key = `idx-${idx}`;
                  const isWrong = wrongKeys.includes(key);
                  const isCorrect = solved && idx === question.correctIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPaused || solved || isWrong}
                      onClick={() => handleIndexPick(idx, question.correctIndex)}
                      className={`relative min-w-[96px] sm:min-w-[118px] h-14 sm:h-16 px-3.5 sm:px-5 rounded-2xl font-display text-base sm:text-xl font-bold border-2 border-b-[5px] transition-transform cursor-pointer ${
                        isCorrect
                          ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                          : isWrong
                          ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                          : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                      } ${shakeKey === key ? 'animate-gentle-shake' : ''}`}
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
