import React, { useEffect, useRef, useState } from 'react';
import { Check, Droplets, Lightbulb, RotateCcw } from 'lucide-react';
import { t, UI_TEXT } from '../data/i18n';
import { Language, WorkshopQuestion } from '../types/game';
import { soundEngine } from '../utils/sound';
import { EgyptShapeSvg, FractionCircleSvg } from './EgyptSvgs';

interface WorkshopMeasureMiniGameProps {
  question: WorkshopQuestion;
  lang: Language;
  onAttempt: (isCorrect: boolean) => void;
  onAdvance: () => void;
}

export const WorkshopMeasureMiniGame: React.FC<WorkshopMeasureMiniGameProps> = ({
  question,
  lang,
  onAttempt,
  onAdvance,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [wrongKeys, setWrongKeys] = useState<string[]>([]);
  const [shakeKey, setShakeKey] = useState<string | null>(null);
  const [pouredMl, setPouredMl] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowHint(false);
    setSolved(false);
    setWrongKeys([]);
    setShakeKey(null);
    setPouredMl(0);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question.id]);

  const triggerWin = () => {
    setSolved(true);
    soundEngine.playCorrect();
    onAttempt(true);
    timerRef.current = setTimeout(() => onAdvance(), 950);
  };

  const triggerMiss = (key: string) => {
    soundEngine.playGentleMiss();
    setWrongKeys((prev) => [...prev, key]);
    setShakeKey(key);
    setShowHint(true);
    onAttempt(false);
    setTimeout(() => setShakeKey(null), 260);
  };

  const handleCheckCapacity = () => {
    if (question.kind !== 'capacity_pour' || solved) return;
    if (pouredMl === question.targetMl) triggerWin();
    else triggerMiss('check-cap');
  };

  const handleNumberPick = (val: number, answer: number) => {
    const key = String(val);
    if (solved || wrongKeys.includes(key)) return;
    if (val === answer) triggerWin();
    else triggerMiss(key);
  };

  const handleIndexPick = (idx: number, correctIdx: number) => {
    const key = `idx-${idx}`;
    if (solved || wrongKeys.includes(key)) return;
    if (idx === correctIdx) triggerWin();
    else triggerMiss(key);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (solved) return;
      if (e.key.toLowerCase() === 'h') {
        soundEngine.playClick();
        setShowHint((p) => !p);
        return;
      }
      if (question.kind === 'capacity_pour' && e.key === 'Enter') {
        handleCheckCapacity();
      } else if (question.kind === 'measure_length' && e.key >= '1' && e.key <= '4') {
        const val = question.options[Number(e.key) - 1];
        if (val !== undefined) handleNumberPick(val, question.lengthCm);
      } else if (
        (question.kind === 'mass_or_unit' || question.kind === 'fraction_or_shape') &&
        e.key >= '1' &&
        e.key <= '4'
      ) {
        const idx = Number(e.key) - 1;
        if (question.options[idx]) handleIndexPick(idx, question.correctIndex);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none">
      {/* Artisan Workshop Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#FDE68A] via-[#E7C697] to-[#B45309]"
        aria-hidden="true"
      >
        <img
          src="/src/assets/images/egypt_workshop_bg_1794872912622.jpg"
          alt="Egyptian artisan workshop with pyramids through window"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/25" />
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

      {/* Center Measurement / Geometry Table */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">
        {/* 1. CAPACITY POURING JUG (L / mL) */}
        {question.kind === 'capacity_pour' && (
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center gap-6 max-w-2xl w-full justify-center">
            {/* Graduated Glass Jug */}
            <div className="flex items-end gap-3">
              <div className="relative w-32 h-52 rounded-b-3xl rounded-t-lg border-4 border-[#133C3B] bg-[#F8FAFC] overflow-hidden flex flex-col justify-end">
                {/* Water Fill */}
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
                {/* Target Marker Line */}
                <div
                  className="absolute left-0 right-0 border-t-2 border-dashed border-[#D97706] pointer-events-none"
                  style={{ bottom: `${(question.targetMl / question.maxMl) * 100}%` }}
                />
                {/* Tick Labels */}
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
                <div className="text-xs font-bold text-[#64748B]">
                  {t(UI_TEXT.target, lang)}
                </div>
                <div dir="ltr" className="font-display text-2xl font-bold text-[#D97706] tabular-nums">
                  {question.targetMl} {t(UI_TEXT.mlShort, lang)}
                </div>
                <div className="text-xs font-bold text-[#64748B] mt-2">
                  {t(UI_TEXT.collected, lang)}
                </div>
                <div dir="ltr" className="font-display text-2xl font-bold text-[#0284C7] tabular-nums">
                  {pouredMl} {t(UI_TEXT.mlShort, lang)}
                </div>
              </div>
            </div>

            {/* Pour Scoops */}
            <div className="flex flex-col items-center gap-2.5">
              <div className="text-xs font-bold text-[#475569]">
                {lang === 'ar' ? 'اضغط لسكب الماء' : 'Tap scoops to pour'}
              </div>
              <div className="flex flex-wrap justify-center gap-2.5 max-w-[240px]">
                {question.scoops.map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    disabled={solved || pouredMl >= question.maxMl}
                    onClick={() => {
                      soundEngine.playHop();
                      setPouredMl((prev) => Math.min(question.maxMl, prev + ml));
                    }}
                    dir="ltr"
                    className="h-14 px-4 rounded-2xl bg-[#E0F2FE] hover:bg-[#BAE6FD] border-2 border-b-4 border-[#0284C7] text-[#0C4A6E] font-display text-lg font-bold flex items-center gap-1.5 cursor-pointer tabular-nums"
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
            className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-5 sm:p-7 shadow-xl w-full max-w-3xl flex flex-col gap-5"
          >
            {/* Artifact Positioned Above Ruler */}
            <div className="relative h-14 w-full">
              <div
                className="absolute bottom-0 h-11 rounded-xl border-2 border-[#133C3B] flex items-center justify-center text-white font-display font-bold text-sm sm:text-base shadow-sm"
                style={{
                  backgroundColor: question.objectColor,
                  left: `${(question.startCm / question.maxCm) * 100}%`,
                  width: `${(question.lengthCm / question.maxCm) * 100}%`,
                }}
              >
                {t(question.objectName, lang)}
              </div>
            </div>

            {/* Marked Centimeter Ruler */}
            <div className="relative w-full h-14 bg-[#FDE68A] border-2 border-[#78350F] rounded-xl flex items-start">
              {Array.from({ length: question.maxCm + 1 }, (_, cm) => (
                <div
                  key={cm}
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${(cm / question.maxCm) * 100}%` }}
                >
                  <div className="w-0.5 h-4 bg-[#78350F]" />
                  <span className="text-xs sm:text-sm font-bold text-[#451A03] tabular-nums mt-1">
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
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-6 shadow-xl w-full max-w-2xl flex flex-col items-center gap-4">
            <div
              className="w-full flex items-end justify-around gap-4 transition-transform duration-300"
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
              <div className="bg-[#FEF3C7] border-2 border-[#D97706] rounded-2xl px-5 py-4 text-center min-w-[140px]">
                <div className="font-display text-xl font-bold text-[#78350F]">
                  {t(question.leftLabel, lang)}
                </div>
              </div>
              <div className="bg-[#E0F2FE] border-2 border-[#0284C7] rounded-2xl px-5 py-4 text-center min-w-[140px]">
                <div className="font-display text-xl font-bold text-[#0C4A6E]">
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
          <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-6 shadow-xl flex flex-col items-center gap-3 min-w-[280px]">
            {question.subKind === 'fraction' &&
              question.fractionTotalParts &&
              question.fractionShadedParts && (
                <FractionCircleSvg
                  totalParts={question.fractionTotalParts}
                  shadedParts={question.fractionShadedParts}
                  size={164}
                />
              )}

            {question.subKind === 'shape' && question.shape && (
              <EgyptShapeSvg shape={question.shape} size={150} showVertices={showHint} />
            )}

            {question.subKind === 'graph' && question.graphBars && (() => {
              const maxBar = Math.max(...question.graphBars.map((b) => b.count), 1);
              return (
                <div className="flex items-end justify-center gap-5 sm:gap-6 h-48 px-4 pt-4 border-b-2 border-[#133C3B]">
                  {question.graphBars.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <span className="font-display text-lg font-bold text-[#133C3B] tabular-nums">
                        {bar.count}
                      </span>
                      <div
                        className="w-12 sm:w-14 rounded-t-xl border-2 border-[#133C3B]"
                        style={{
                          height: `${Math.max(18, Math.round((bar.count / maxBar) * 112))}px`,
                          backgroundColor: bar.color,
                        }}
                      />
                      <span className="text-xs font-bold text-[#133C3B]">
                        {t(bar.label, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Choice Bar */}
      <div className="relative z-10 pb-6 px-4 flex justify-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {question.kind === 'capacity_pour' && (
            <>
              <button
                type="button"
                disabled={solved}
                onClick={() => {
                  soundEngine.playClick();
                  setPouredMl(0);
                }}
                className="h-14 px-5 rounded-2xl bg-[#FFFDF7] border-2 border-b-4 border-[#133C3B] text-[#133C3B] font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t(UI_TEXT.clearTray, lang)}</span>
              </button>
              <button
                type="button"
                disabled={solved}
                onClick={handleCheckCapacity}
                className={`h-14 px-7 rounded-2xl border-2 border-b-4 font-display text-xl font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap ${
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
                  disabled={solved || isWrong}
                  onClick={() => handleNumberPick(cm, question.lengthCm)}
                  className={`relative min-w-[100px] h-16 px-5 rounded-2xl font-display text-2xl font-bold tabular-nums border-2 border-b-[5px] cursor-pointer ${
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
                  <span className="absolute top-1.5 right-2 text-[11px] font-sans font-bold text-[#64748B]">
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
                  disabled={solved || isWrong}
                  onClick={() => handleIndexPick(idx, question.correctIndex)}
                  className={`relative min-w-[116px] h-16 px-5 rounded-2xl font-display text-lg sm:text-xl font-bold border-2 border-b-[5px] cursor-pointer ${
                    isCorrect
                      ? 'bg-[#16A34A] border-[#14532D] text-white scale-105'
                      : isWrong
                      ? 'bg-[#E2E8F0] border-[#94A3B8] text-[#94A3B8] opacity-60 cursor-not-allowed'
                      : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:-translate-y-0.5'
                  } ${shakeKey === key ? 'animate-gentle-shake' : ''}`}
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
