import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Flag,
  MessageSquareText,
  RotateCcw,
  SkipForward,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EGYPT_SUBJECTS } from '../data/egyptLevels';
import { t, UI_TEXT } from '../data/i18n';
import {
  PlacementAnswerRecord,
  PlacementQuestion,
  buildPlacementReportHtml,
  comparePlacementResults,
  generatePlacementExam,
  getTierLabel,
  scorePlacementExam,
} from '../data/placementExam';
import {
  ActiveQuestion,
  Language,
  PlacementExamResult,
  PlacementTier,
  SubjectId,
} from '../types/game';
import { soundEngine } from '../utils/sound';
import { stopSpeech } from '../utils/speech';
import { AnalogClockSvg, EgyptShapeSvg, FractionCircleSvg } from './EgyptSvgs';
import { ReadAloudButton } from './ReadAloudButton';

interface PlacementExamScreenProps {
  lang: Language;
  placementHistory: PlacementExamResult[];
  initialView?: 'exam' | 'results';
  onCompleteExam: (result: PlacementExamResult) => void;
  onStartRecommendedPath: (result: PlacementExamResult) => void;
  onExit: () => void;
}

const formatClockSeconds = (totalSec: number) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const TIER_STYLES: Record<
  PlacementTier,
  { badge: string; bar: string; border: string }
> = {
  needs_support: {
    badge: 'bg-[#FFE4E6] text-[#BE123C] border-[#FDA4AF]',
    bar: 'bg-[#E11D48]',
    border: 'border-[#FECDD3]',
  },
  developing: {
    badge: 'bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]',
    bar: 'bg-[#D97706]',
    border: 'border-[#FDE68A]',
  },
  strong: {
    badge: 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]',
    bar: 'bg-[#059669]',
    border: 'border-[#BBF7D0]',
  },
};

const ExamVisualStage: React.FC<{ visual: ActiveQuestion; lang: Language }> = ({
  visual,
  lang,
}) => {
  const { data } = visual;

  if (data.kind === 'place_value') {
    const pvAria =
      lang === 'ar'
        ? data.hundreds > 0
          ? `مكعبات القيمة المكانية: ${data.hundreds} مئات و ${data.tens} عشرات و ${data.ones} آحاد`
          : `مكعبات القيمة المكانية: ${data.tens} عشرات و ${data.ones} آحاد`
        : data.hundreds > 0
        ? `Place value blocks: ${data.hundreds} hundreds, ${data.tens} tens, and ${data.ones} ones`
        : `Place value blocks: ${data.tens} tens and ${data.ones} ones`;

    return (
      <div
        dir="ltr"
        role="img"
        aria-label={pvAria}
        className="w-full max-w-xl bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-3 sm:p-4 grid grid-cols-3 gap-2 sm:gap-4"
      >
        <div className="rounded-xl bg-[#FFF7ED] border border-[#FDBA74] p-2 flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#9A3412]">{t(UI_TEXT.hundreds, lang)}</span>
          <div className="flex flex-wrap items-center justify-center gap-1 min-h-[44px]">
            {Array.from({ length: data.hundreds }, (_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded bg-[#F97316] border border-[#7C2D12] grid grid-cols-3 gap-px p-0.5"
                aria-hidden="true"
              >
                {Array.from({ length: 9 }, (_, c) => (
                  <span key={c} className="bg-[#FED7AA]/70 rounded-[1px]" />
                ))}
              </div>
            ))}
          </div>
          <span className="font-display text-sm font-bold text-[#7C2D12] tabular-nums">
            {data.hundreds} × 100
          </span>
        </div>

        <div className="rounded-xl bg-[#F0FDFA] border border-[#5EEAD4] p-2 flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#115E59]">{t(UI_TEXT.tens, lang)}</span>
          <div className="flex flex-wrap items-center justify-center gap-1 min-h-[44px]">
            {Array.from({ length: data.tens }, (_, i) => (
              <div
                key={i}
                className="w-2 h-8 rounded-sm bg-[#14B8A6] border border-[#134E4A]"
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="font-display text-sm font-bold text-[#115E59] tabular-nums">
            {data.tens} × 10
          </span>
        </div>

        <div className="rounded-xl bg-[#FEFCE8] border border-[#FDE047] p-2 flex flex-col items-center gap-1.5">
          <span className="text-[11px] font-bold text-[#854D0E]">{t(UI_TEXT.ones, lang)}</span>
          <div className="flex flex-wrap items-center justify-center gap-1 min-h-[44px] max-w-[90px]">
            {Array.from({ length: data.ones }, (_, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-sm bg-[#F59E0B] border border-[#78350F]"
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="font-display text-sm font-bold text-[#854D0E] tabular-nums">
            {data.ones}
          </span>
        </div>
      </div>
    );
  }

  if (data.kind === 'money_change_or_compare') {
    return (
      <div className="w-full max-w-lg bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-4 flex items-center justify-around gap-3">
        <div className="bg-[#FEF3C7] border border-[#D97706] rounded-xl px-4 py-2.5 text-center flex-1 font-display text-xl sm:text-2xl font-bold text-[#78350F] tabular-nums">
          {t(data.leftLabel, lang)}
        </div>
        <div className="w-11 h-11 rounded-xl bg-[#E0F2FE] border border-dashed border-[#0284C7] flex items-center justify-center font-display text-2xl font-bold text-[#0369A1] shrink-0">
          {data.subKind === 'compare' ? '?' : '−'}
        </div>
        <div className="bg-[#CCFBF1] border border-[#0D9488] rounded-xl px-4 py-2.5 text-center flex-1 font-display text-xl sm:text-2xl font-bold text-[#115E59] tabular-nums">
          {t(data.rightLabel, lang)}
        </div>
      </div>
    );
  }

  if (data.kind === 'vertical_math') {
    const topStr = String(data.top).padStart(3, ' ');
    const botStr = String(data.bottom).padStart(3, ' ');
    return (
      <div
        dir="ltr"
        role="img"
        aria-label={
          lang === 'ar'
            ? `مسألة رأسية: ${data.top} ${data.operator === '+' ? 'زائد' : 'ناقص'} ${data.bottom}`
            : `Vertical problem: ${data.top} ${data.operator === '+' ? 'plus' : 'minus'} ${data.bottom}`
        }
        className="bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl px-7 py-4 inline-flex flex-col items-end font-display text-3xl font-bold text-[#133C3B] tabular-nums"
      >
        <div className="tracking-[0.28em]">{topStr}</div>
        <div className="flex items-center gap-2">
          <span className="text-[#D97706]">{data.operator}</span>
          <span className="tracking-[0.28em]">{botStr}</span>
        </div>
        <div className="w-full h-1 bg-[#133C3B] rounded-full my-1" />
        <div className="text-[#0D9488] tracking-[0.28em]">? ?</div>
      </div>
    );
  }

  if (data.kind === 'array_multiply') {
    return (
      <div
        role="img"
        aria-label={
          lang === 'ar'
            ? `مصفوفة من ${data.rows} صفوف، في كل صف ${data.cols} عناصر`
            : `Array of ${data.rows} rows with ${data.cols} items in each row`
        }
        className="bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-4 flex flex-col items-center gap-2"
      >
        <div dir="ltr" className="font-display text-lg font-bold text-[#133C3B] tabular-nums">
          {data.rows} × {data.cols} = ?
        </div>
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: data.rows }, (_, r) => (
            <div key={r} className="flex items-center gap-1.5">
              {Array.from({ length: data.cols }, (_, c) => (
                <div
                  key={c}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#D97706] border-2 border-[#78350F]"
                  aria-hidden="true"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.kind === 'read_clock') {
    return (
      <div className="bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-3 flex justify-center">
        <AnalogClockSvg hour={data.hour} minute={data.minute} size={168} lang={lang} hideExactTime />
      </div>
    );
  }

  if (data.kind === 'elapsed_or_calendar') {
    return (
      <div className="bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl px-5 py-3 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-[#B45309] shrink-0" />
        <span dir="ltr" className="font-display text-xl sm:text-2xl font-bold text-[#133C3B] tabular-nums">
          {t(data.displayBadge, lang)}
        </span>
      </div>
    );
  }

  if (data.kind === 'measure_length') {
    return (
      <div
        dir="ltr"
        role="img"
        aria-label={
          lang === 'ar'
            ? `مسطرة من 0 إلى ${data.maxCm} سم تُظهر ${data.objectName.ar} من ${data.startCm} إلى ${data.startCm + data.lengthCm} سم`
            : `Ruler from 0 to ${data.maxCm} cm showing ${data.objectName.en} from ${data.startCm} cm to ${data.startCm + data.lengthCm} cm`
        }
        className="w-full max-w-xl bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-3 sm:p-4 flex flex-col gap-3"
      >
        <div className="relative h-10 w-full">
          <div
            className="absolute bottom-0 h-9 rounded-lg border-2 border-[#133C3B] flex items-center justify-center text-white font-display font-bold text-xs px-1.5 truncate"
            style={{
              backgroundColor: data.objectColor,
              left: `${(data.startCm / data.maxCm) * 100}%`,
              width: `${(data.lengthCm / data.maxCm) * 100}%`,
            }}
          >
            {t(data.objectName, lang)}
          </div>
        </div>
        <div className="relative w-full h-12 bg-[#FDE68A] border-2 border-[#78350F] rounded-lg">
          {Array.from({ length: data.maxCm + 1 }, (_, cm) => (
            <div
              key={cm}
              className="absolute top-0 flex flex-col items-center -translate-x-1/2"
              style={{ left: `${(cm / data.maxCm) * 100}%` }}
            >
              <div className="w-0.5 h-3 bg-[#78350F]" />
              <span className="text-[10px] font-bold text-[#451A03] tabular-nums mt-0.5">{cm}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.kind === 'mass_or_unit') {
    return (
      <div
        role="img"
        aria-label={
          lang === 'ar'
            ? `ميزان يقارن ${data.leftLabel.ar} و ${data.rightLabel.ar}`
            : `Balance scale comparing ${data.leftLabel.en} and ${data.rightLabel.en}`
        }
        className="w-full max-w-lg bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-4 flex flex-col items-center gap-2"
      >
        <div
          className="w-full flex items-end justify-around gap-3"
          style={{
            transform: `rotate(${
              data.leftWeightGrams > data.rightWeightGrams
                ? -5
                : data.leftWeightGrams < data.rightWeightGrams
                ? 5
                : 0
            }deg)`,
          }}
        >
          <div className="bg-[#FEF3C7] border border-[#D97706] rounded-xl px-3 py-2 text-center flex-1 font-display text-sm sm:text-base font-bold text-[#78350F]">
            {t(data.leftLabel, lang)}
          </div>
          <div className="bg-[#E0F2FE] border border-[#0284C7] rounded-xl px-3 py-2 text-center flex-1 font-display text-sm sm:text-base font-bold text-[#0C4A6E]">
            {t(data.rightLabel, lang)}
          </div>
        </div>
        <div className="w-2/3 h-2 bg-[#78350F] rounded-full" aria-hidden="true" />
      </div>
    );
  }

  if (data.kind === 'fraction_or_shape') {
    return (
      <div className="bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-2xl p-4 flex justify-center">
        {data.subKind === 'fraction' && data.fractionTotalParts && data.fractionShadedParts && (
          <FractionCircleSvg
            totalParts={data.fractionTotalParts}
            shadedParts={data.fractionShadedParts}
            size={140}
            lang={lang}
          />
        )}
        {data.subKind === 'shape' && data.shape && (
          <EgyptShapeSvg
            shape={data.shape}
            size={130}
            lang={lang}
            hideName={
              data.prompt.en.toLowerCase().includes('name') ||
              data.prompt.en.toLowerCase().includes('identify')
            }
          />
        )}
        {data.subKind === 'graph' && data.graphBars && (() => {
          const maxBar = Math.max(...data.graphBars.map((b) => b.count), 1);
          const graphAria =
            lang === 'ar'
              ? `رسم بياني: ${data.graphBars.map((b) => `${b.label.ar} ${b.count}`).join('، ')}`
              : `Bar graph: ${data.graphBars.map((b) => `${b.label.en} ${b.count}`).join(', ')}`;
          return (
            <div
              role="img"
              aria-label={graphAria}
              className="flex items-end justify-center gap-4 h-36 px-3 pt-3 border-b-2 border-[#133C3B]"
            >
              {data.graphBars.map((bar, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="font-display text-sm font-bold text-[#133C3B] tabular-nums">
                    {bar.count}
                  </span>
                  <div
                    className="w-10 rounded-t-lg border-2 border-[#133C3B]"
                    style={{
                      height: `${Math.max(16, Math.round((bar.count / maxBar) * 80))}px`,
                      backgroundColor: bar.color,
                    }}
                  />
                  <span className="text-[11px] font-bold text-[#133C3B]">{t(bar.label, lang)}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
};

export const PlacementExamScreen: React.FC<PlacementExamScreenProps> = ({
  lang,
  placementHistory,
  initialView = 'exam',
  onCompleteExam,
  onStartRecommendedPath,
  onExit,
}) => {
  const [view, setView] = useState<'exam' | 'results'>(
    initialView === 'results' && placementHistory.length > 0 ? 'results' : 'exam'
  );
  const [questions, setQuestions] = useState<PlacementQuestion[]>(() => generatePlacementExam());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, PlacementAnswerRecord>>({});
  const [skippedIndices, setSkippedIndices] = useState<number[]>([]);
  const [softTimerOn, setSoftTimerOn] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [activeResult, setActiveResult] = useState<PlacementExamResult | null>(
    initialView === 'results' && placementHistory.length > 0 ? placementHistory[0] : null
  );
  const [previousResultForView, setPreviousResultForView] = useState<PlacementExamResult | null>(
    initialView === 'results' && placementHistory.length > 1 ? placementHistory[1] : null
  );

  // Track elapsed time per question accurately (no pause-scoring tricks)
  const questionStartRef = useRef<number>(Date.now());
  const accumulatedMsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [currentIdx, questions]);

  useEffect(() => {
    if (view !== 'exam') return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [view]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  const subjectMap = useMemo(() => {
    const map = new Map<SubjectId, (typeof EGYPT_SUBJECTS)[number]>();
    for (const s of EGYPT_SUBJECTS) map.set(s.id, s);
    return map;
  }, []);

  const flushQuestionTime = (qId: string): number => {
    const delta = Math.max(0, Date.now() - questionStartRef.current);
    const total = (accumulatedMsRef.current[qId] ?? 0) + delta;
    accumulatedMsRef.current[qId] = total;
    questionStartRef.current = Date.now();
    return total;
  };

  const findNextUnanswered = (fromIdx: number, nextAnswers: Record<string, PlacementAnswerRecord>) => {
    for (let i = fromIdx + 1; i < questions.length; i++) {
      if (!nextAnswers[questions[i].id]) return i;
    }
    for (let i = 0; i < fromIdx; i++) {
      if (!nextAnswers[questions[i].id]) return i;
    }
    return -1;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    stopSpeech();
    soundEngine.playClick();
    const responseTimeMs = flushQuestionTime(currentQuestion.id);

    const nextAnswers: Record<string, PlacementAnswerRecord> = {
      ...answers,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selectedIndex: optionIndex,
        responseTimeMs,
      },
    };
    setAnswers(nextAnswers);
    setSkippedIndices((prev) => prev.filter((i) => i !== currentIdx));

    // Calm automatic progression to the next unanswered question (never reveals correctness)
    const nextIdx = findNextUnanswered(currentIdx, nextAnswers);
    if (nextIdx >= 0) {
      setCurrentIdx(nextIdx);
    }
  };

  const handleSkip = () => {
    if (!currentQuestion) return;
    stopSpeech();
    soundEngine.playClick();
    flushQuestionTime(currentQuestion.id);
    if (!answers[currentQuestion.id]) {
      setSkippedIndices((prev) => (prev.includes(currentIdx) ? prev : [...prev, currentIdx]));
    }
    const nextIdx = (currentIdx + 1) % questions.length;
    setCurrentIdx(nextIdx);
  };

  const handleJumpToIndex = (targetIdx: number) => {
    if (!currentQuestion) return;
    stopSpeech();
    soundEngine.playClick();
    flushQuestionTime(currentQuestion.id);
    setCurrentIdx(targetIdx);
  };

  const handleFinishExam = () => {
    stopSpeech();
    soundEngine.playMasteryFanfare();
    const prevBeforeThis = placementHistory[0] ?? null;
    const computed = scorePlacementExam(questions, answers);
    setPreviousResultForView(prevBeforeThis);
    setActiveResult(computed);
    setView('results');
    onCompleteExam(computed);
  };

  const handleRetake = () => {
    stopSpeech();
    soundEngine.playClick();
    setQuestions(generatePlacementExam());
    setCurrentIdx(0);
    setAnswers({});
    setSkippedIndices([]);
    setElapsedSec(0);
    accumulatedMsRef.current = {};
    questionStartRef.current = Date.now();
    setView('exam');
  };

  const handleDownloadReport = () => {
    if (!activeResult) return;
    soundEngine.playClick();
    const html = buildPlacementReportHtml(activeResult, previousResultForView, lang);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = activeResult.completedAt.slice(0, 10);
    a.href = url;
    a.download = `nile-numbers-level-check-${dateStamp}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Safe keyboard shortcuts 1..4 during the exam (never hijacking focused controls on Enter/Space)
  useEffect(() => {
    if (view !== 'exam' || !currentQuestion) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        const idx = Number(e.key) - 1;
        if (idx < currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(idx);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (view === 'results' && activeResult) {
    const overallPct = Math.round(activeResult.overallAccuracy * 100);
    const avgSec = (activeResult.avgResponseMs / 1000).toFixed(1);
    const comparisons = previousResultForView
      ? comparePlacementResults(activeResult, previousResultForView)
      : [];
    const changedComparisons = comparisons.filter((c) => c.changed);

    return (
      <div className="min-h-screen w-full bg-[#FAF3E3] text-[#133C3B] pb-16 overflow-x-hidden">
        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-8 space-y-5">
          {/* Top bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onExit();
              }}
              className="h-10 px-3.5 rounded-xl bg-white border-2 border-[#133C3B]/20 hover:border-[#133C3B] text-sm font-bold text-[#133C3B] flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              <span>{t(UI_TEXT.homeSection, lang)}</span>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="h-10 px-3.5 rounded-xl bg-white border-2 border-[#0D9488] text-[#0F766E] hover:bg-[#F0FDFA] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t(UI_TEXT.downloadReport, lang)}</span>
              </button>
              <button
                type="button"
                onClick={handleRetake}
                className="h-10 px-3.5 rounded-xl bg-[#FEF3C7] border-2 border-[#D97706] text-[#78350F] hover:bg-[#FDE68A] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t(UI_TEXT.retakeExam, lang)}</span>
              </button>
            </div>
          </div>

          {/* Hero Results Card */}
          <section className="bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-5 sm:p-7 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-bold">
                  <Award className="w-4 h-4" />
                  <span>{t(UI_TEXT.levelCheckResultsTitle, lang)}</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#133C3B]">
                  {t(activeResult.overallLevel, lang)}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-[#475569]">
                  {t(UI_TEXT.noPenaltyNote, lang)}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="px-4 py-2.5 rounded-2xl bg-[#ECFDF5] border-2 border-[#16A34A]/40 text-center">
                  <div className="font-display text-2xl font-bold text-[#15803D] tabular-nums">
                    {overallPct}%
                  </div>
                  <div className="text-[11px] font-bold text-[#166534] tabular-nums">
                    {activeResult.totalCorrect}/{activeResult.totalQuestions}
                  </div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-[#F0F9FF] border-2 border-[#0284C7]/35 text-center">
                  <div className="font-display text-2xl font-bold text-[#0369A1] tabular-nums">
                    {avgSec}s
                  </div>
                  <div className="text-[11px] font-bold text-[#075985]">
                    {t(UI_TEXT.avgResponseTime, lang)}
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Action: Start Recommended Path */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onStartRecommendedPath(activeResult);
                }}
                className="w-full sm:w-auto h-13 px-6 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] border-2 border-b-[5px] border-[#133C3B] text-white font-display text-lg font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Compass className="w-5 h-5" />
                <span>{t(UI_TEXT.startRecommendedPath, lang)}</span>
                <ArrowRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </section>

          {/* Top 2 Strengths & Top 2 Areas to Practise */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-[#86EFAC] rounded-2xl p-4 sm:p-5 space-y-2.5">
              <h2 className="font-display text-lg font-bold text-[#15803D] flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span>{t(UI_TEXT.topStrengths, lang)}</span>
              </h2>
              <ul className="space-y-2">
                {activeResult.topStrengths.map((sid) => {
                  const info = subjectMap.get(sid);
                  const stat = activeResult.subjects.find((s) => s.subjectId === sid);
                  return (
                    <li
                      key={sid}
                      className="flex items-center justify-between gap-2 bg-[#F0FDF4] rounded-xl px-3 py-2 text-sm font-bold text-[#14532D]"
                    >
                      <span>{info ? t(info.title, lang) : sid}</span>
                      {stat && (
                        <span className="tabular-nums text-xs px-2 py-0.5 rounded-full bg-white border border-[#86EFAC]">
                          {Math.round(stat.accuracy * 100)}%
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white border-2 border-[#FCD34D] rounded-2xl p-4 sm:p-5 space-y-2.5">
              <h2 className="font-display text-lg font-bold text-[#B45309] flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{t(UI_TEXT.topAreasToPractice, lang)}</span>
              </h2>
              <ul className="space-y-2">
                {activeResult.topAreasToPractice.map((sid) => {
                  const info = subjectMap.get(sid);
                  const stat = activeResult.subjects.find((s) => s.subjectId === sid);
                  return (
                    <li
                      key={sid}
                      className="flex items-center justify-between gap-2 bg-[#FFFBEB] rounded-xl px-3 py-2 text-sm font-bold text-[#78350F]"
                    >
                      <span>{info ? t(info.title, lang) : sid}</span>
                      {stat && (
                        <span className="tabular-nums text-xs px-2 py-0.5 rounded-full bg-white border border-[#FCD34D]">
                          {t(UI_TEXT.recommendedStart, lang)} {stat.recommendedStartLevel}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Comparison to Previous Check */}
          {previousResultForView && (
            <section className="bg-white border-2 border-[#BAE6FD] rounded-2xl p-4 sm:p-5 space-y-2.5">
              <h2 className="font-display text-lg font-bold text-[#0369A1] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>{t(UI_TEXT.previousComparison, lang)}</span>
              </h2>
              {changedComparisons.length === 0 ? (
                <p className="text-sm font-semibold text-[#475569]">
                  {lang === 'ar'
                    ? 'جميع الموضوعات حافظت على نفس التصنيف مقارنة بالمحاولة السابقة.'
                    : 'All subjects stayed in the same tier compared to your previous check.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {changedComparisons.map((c) => (
                    <span
                      key={c.subjectId}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                        c.deltaAccuracy >= 0
                          ? 'bg-[#ECFDF5] border-[#86EFAC] text-[#166534]'
                          : 'bg-[#FFF7ED] border-[#FDBA74] text-[#9A3412]'
                      }`}
                    >
                      {t(c.summary, lang)}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* 12-Subject Bar Chart Breakdown */}
          <section className="bg-[#FFFDF7] border-2 border-[#133C3B]/20 rounded-3xl p-4 sm:p-6 space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#133C3B]">
              {lang === 'ar' ? 'النتائج حسب كل موضوع (١٢ موضوعًا)' : 'Results Across All 12 Subjects'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeResult.subjects.map((sub) => {
                const info = subjectMap.get(sub.subjectId);
                const pct = Math.round(sub.accuracy * 100);
                const style = TIER_STYLES[sub.tier];
                return (
                  <div
                    key={sub.subjectId}
                    className={`bg-white border-2 ${style.border} rounded-2xl p-3.5 space-y-2`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-[#133C3B] leading-snug">
                        {info ? t(info.title, lang) : sub.subjectId}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[11px] font-bold whitespace-nowrap shrink-0 ${style.badge}`}
                      >
                        {t(getTierLabel(sub.tier), lang)}
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${style.bar}`}
                        style={{ width: `${Math.max(6, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-[#475569] tabular-nums">
                      <span>
                        {sub.correct}/{sub.total} ({pct}%) · {(sub.avgResponseMs / 1000).toFixed(1)}s
                      </span>
                      <span className="font-bold text-[#0F766E]">
                        {t(UI_TEXT.recommendedStart, lang)} {sub.recommendedStartLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  /* ============================================================================
     ACTIVE EXAM VIEW (CALM, MULTIPLE-CHOICE ONLY, NO HINTS, NO AUTO-REVEAL)
     ============================================================================ */
  const subjInfo = currentQuestion ? subjectMap.get(currentQuestion.subjectId) : null;
  const currentSelected = currentQuestion ? answers[currentQuestion.id]?.selectedIndex : undefined;
  const progressPct = Math.round((answeredCount / Math.max(1, questions.length)) * 100);
  const fullSpeakText = currentQuestion
    ? currentQuestion.storyContext
      ? `${t(currentQuestion.storyContext, lang)} ${t(currentQuestion.prompt, lang)}`
      : t(currentQuestion.prompt, lang)
    : '';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FAF3E3] via-[#FFFDF7] to-[#F5E6C8] text-[#133C3B] flex flex-col overflow-x-hidden">
      {/* Calm Top Exam Header */}
      <header className="sticky top-0 z-20 bg-[#FFFDF7]/95 backdrop-blur-md border-b-2 border-[#133C3B]/15 px-3 sm:px-6 py-2.5">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                soundEngine.playClick();
                onExit();
              }}
              className="h-9 px-3 rounded-xl bg-white border border-[#133C3B]/25 hover:border-[#133C3B] text-xs sm:text-sm font-bold text-[#133C3B] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <ArrowLeft className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              <span>{t(UI_TEXT.homeSection, lang)}</span>
            </button>

            <div className="font-display text-sm sm:text-base font-bold text-[#133C3B] tabular-nums text-center">
              {t(UI_TEXT.questionProgress, lang)} {currentIdx + 1}/{questions.length}
            </div>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSoftTimerOn((prev) => !prev);
              }}
              aria-pressed={softTimerOn}
              className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 tabular-nums ${
                softTimerOn
                  ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0369A1]'
                  : 'bg-white border-[#133C3B]/20 text-[#64748B]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {softTimerOn
                  ? formatClockSeconds(elapsedSec)
                  : t(UI_TEXT.softTimerOff, lang)}
              </span>
            </button>
          </div>

          {/* Calm Progress Bar */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex-1 h-2.5 rounded-full bg-[#E7E5E4] overflow-hidden"
              role="progressbar"
              aria-valuenow={answeredCount}
              aria-valuemin={0}
              aria-valuemax={questions.length}
            >
              <div
                className="h-full bg-[#0D9488] rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-[#475569] tabular-nums whitespace-nowrap">
              {t(UI_TEXT.answeredCount, lang)}: {answeredCount}/{questions.length}
            </span>
          </div>
        </div>
      </header>

      {/* Exam Question Body */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 flex flex-col justify-between gap-4">
        {currentQuestion && (
          <div className="space-y-4">
            {/* Subject & Format Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-[#FEF3C7] border border-[#D97706]/40 text-xs font-bold text-[#78350F]">
                  {subjInfo ? t(subjInfo.title, lang) : currentQuestion.subjectId}
                </span>
                {currentQuestion.format === 'word_problem' && (
                  <span className="px-2.5 py-1 rounded-xl bg-[#E0F2FE] border border-[#0284C7]/35 text-xs font-bold text-[#0369A1] flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t(UI_TEXT.wordProblemTag, lang)}</span>
                  </span>
                )}
                {currentQuestion.format === 'explain_it' && (
                  <span className="px-2.5 py-1 rounded-xl bg-[#F3E8FF] border border-[#9333EA]/35 text-xs font-bold text-[#6B21A8] flex items-center gap-1">
                    <MessageSquareText className="w-3.5 h-3.5" />
                    <span>{t(UI_TEXT.explainItTag, lang)}</span>
                  </span>
                )}
              </div>

              <ReadAloudButton text={fullSpeakText} lang={lang} />
            </div>

            {/* Prompt Card */}
            <div className="bg-white border-2 border-[#133C3B] rounded-3xl p-4 sm:p-6 shadow-md space-y-3">
              {currentQuestion.storyContext && (
                <p className="text-xs sm:text-sm font-bold text-[#0F766E]">
                  {t(currentQuestion.storyContext, lang)}
                </p>
              )}
              <h1 className="font-display text-lg sm:text-2xl font-bold text-[#133C3B] leading-snug">
                {t(currentQuestion.prompt, lang)}
              </h1>

              {currentQuestion.visualQuestion && (
                <div className="pt-2 flex justify-center">
                  <ExamVisualStage visual={currentQuestion.visualQuestion} lang={lang} />
                </div>
              )}
            </div>

            {/* Multiple-Choice Answer Cards (No Typing, No Auto-Reveal) */}
            <div
              className={`grid gap-2.5 sm:gap-3 ${
                currentQuestion.format === 'explain_it'
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = currentSelected === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    aria-pressed={isSelected}
                    className={`min-h-[56px] w-full px-4 py-3 rounded-2xl border-2 border-b-[4px] text-start font-display text-base sm:text-lg font-bold transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#CCFBF1] border-[#0D9488] text-[#115E59]'
                        : 'bg-[#FFFDF7] border-[#133C3B] text-[#133C3B] hover:bg-[#FEF3C7]/60'
                    }`}
                  >
                    <span className="leading-snug">{t(opt, lang)}</span>
                    <span className="w-7 h-7 rounded-lg bg-[#133C3B]/10 text-[#133C3B] text-xs font-sans font-extrabold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigation: Skip, Skipped Return Strip, Previous/Next, and Finish */}
        <div className="space-y-3 pt-2 pb-4 border-t border-[#133C3B]/15">
          {skippedIndices.length > 0 && (
            <div className="bg-[#FFFBEB] border border-[#F59E0B]/50 rounded-2xl p-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-[#92400E] px-1">
                {t(UI_TEXT.skippedQuestions, lang)}:
              </span>
              {skippedIndices.map((sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => handleJumpToIndex(sIdx)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-bold tabular-nums border cursor-pointer ${
                    sIdx === currentIdx
                      ? 'bg-[#D97706] text-white border-[#92400E]'
                      : 'bg-white text-[#92400E] border-[#F59E0B] hover:bg-[#FEF3C7]'
                  }`}
                >
                  #{sIdx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => handleJumpToIndex(Math.max(0, currentIdx - 1))}
                className="h-11 px-3.5 rounded-xl bg-white border-2 border-[#133C3B]/20 disabled:opacity-40 text-xs sm:text-sm font-bold text-[#133C3B] cursor-pointer"
              >
                {t(UI_TEXT.regroupPrevBtn, lang)}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="h-11 px-4 rounded-xl bg-[#FEF3C7] border-2 border-[#D97706] text-[#78350F] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
                <span>{t(UI_TEXT.skipQuestion, lang)}</span>
              </button>
            </div>

            {allAnswered ? (
              <button
                type="button"
                onClick={handleFinishExam}
                className="h-12 px-5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] border-2 border-b-[4px] border-[#14532D] text-white font-display text-base sm:text-lg font-bold flex items-center gap-2 shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t(UI_TEXT.finishLevelCheck, lang)}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (skippedIndices.length > 0) {
                    handleJumpToIndex(skippedIndices[0]);
                  } else {
                    const nextU = findNextUnanswered(currentIdx, answers);
                    if (nextU >= 0) handleJumpToIndex(nextU);
                  }
                }}
                className="h-11 px-4 rounded-xl bg-[#E0F2FE] border-2 border-[#0284C7]/40 text-[#0369A1] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? `تبقى ${questions.length - answeredCount}`
                    : `${questions.length - answeredCount} left`}
                </span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
