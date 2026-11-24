import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Blocks,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  Droplets,
  Grid3X3,
  PieChart,
  Ruler,
  Scale,
  Shapes,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import { EGYPT_LEVELS, EGYPT_SUBJECTS } from '../data/egyptLevels';
import { PRACTICE_SUBJECTS, PracticeSubjectInfo } from '../data/practiceSubjects';
import { t, UI_TEXT } from '../data/i18n';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import { BilingualText, PlayerProgress, SubjectId, WorldId } from '../types/game';
import { getSubjectMasteryStats, SubjectMasteryStats } from '../utils/scoring';
import { soundEngine } from '../utils/sound';
import { EgyptStickerSvg } from './EgyptSvgs';
import { SectionNavHeader } from './SectionNavHeader';

interface PracticeMenuScreenProps {
  progress: PlayerProgress;
  initialFilter?: WorldId | 'all';
  onSelectSubject: (subjectId: SubjectId) => void;
  onMarkSubjectCelebrated: (subjectId: SubjectId) => void;
  onNavigateHome: () => void;
  onNavigateGame: () => void;
  onNavigateStickers: () => void;
  onNavigateExam: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

const FILTER_TABS: { id: WorldId | 'all'; label: BilingualText }[] = [
  { id: 'all', label: UI_TEXT.allSubjects },
  { id: 'bazaar', label: { en: 'Numbers & Money', ar: 'الأعداد والنقود' } },
  { id: 'nile', label: { en: 'Add, Sub & Arrays', ar: 'الجمع والمصفوفات' } },
  { id: 'clock', label: { en: 'Time & Calendar', ar: 'الوقت والتقويم' } },
  { id: 'workshop', label: { en: 'Measure, Shapes & Data', ar: 'القياس والأشكال والبيانات' } },
];

const WORLD_LABELS: Record<WorldId, BilingualText> = {
  bazaar: { en: 'Cairo Bazaar', ar: 'سوق القاهرة' },
  nile: { en: 'Nile Felucca', ar: 'فلوكة النيل' },
  clock: { en: 'Oasis Clocktower', ar: 'برج الساعة' },
  workshop: { en: 'Pyramid Workshop', ar: 'ورشة القياس' },
};

const CONFETTI_COLORS = ['#F59E0B', '#0D9488', '#EA580C', '#38BDF8', '#16A34A', '#EC4899'];

interface ConfettiSpec {
  id: number;
  startX: number;
  driftX: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  color: string;
  shape: 'ribbon' | 'diamond' | 'circle';
}

function buildConfettiBurst(): ConfettiSpec[] {
  return Array.from({ length: 38 }, (_, i) => {
    const angleSeed = (i * 37) % 100;
    const shapes: ConfettiSpec['shape'][] = ['ribbon', 'diamond', 'circle'];
    return {
      id: i,
      startX: 6 + ((i * 29) % 88),
      driftX: ((angleSeed - 50) / 50) * 110,
      delay: (i % 10) * 0.06,
      duration: 2.1 + (i % 5) * 0.35,
      size: 8 + (i % 4) * 3,
      rotation: (i % 2 === 0 ? 1 : -1) * (240 + (i % 5) * 90),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      shape: shapes[i % shapes.length],
    };
  });
}

export function SubjectIcon({ id, color }: { id: SubjectId; color: string }) {
  const props = { className: 'w-6 h-6', style: { color } };
  switch (id) {
    case 'place_value':
      return <Blocks {...props} />;
    case 'money':
      return <Banknote {...props} />;
    case 'vertical_math':
      return <Calculator {...props} />;
    case 'arrays':
      return <Grid3X3 {...props} />;
    case 'clock':
      return <Clock {...props} />;
    case 'calendar':
      return <CalendarDays {...props} />;
    case 'length':
      return <Ruler {...props} />;
    case 'capacity':
      return <Droplets {...props} />;
    case 'mass':
      return <Scale {...props} />;
    case 'shapes':
      return <Shapes {...props} />;
    case 'fractions':
      return <PieChart {...props} />;
    case 'graphs':
      return <BarChart3 {...props} />;
  }
}

export const PracticeMenuScreen: React.FC<PracticeMenuScreenProps> = ({
  progress,
  initialFilter = 'all',
  onSelectSubject,
  onMarkSubjectCelebrated,
  onNavigateHome,
  onNavigateGame,
  onNavigateStickers,
  onNavigateExam,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const lang = progress.language;
  const [filter, setFilter] = useState<WorldId | 'all'>(initialFilter);
  const [celebratingSubjectId, setCelebratingSubjectId] = useState<SubjectId | null>(null);
  const [burstKey, setBurstKey] = useState(0);
  const celebrationDialogRef = useRef<HTMLDivElement>(null);

  const confettiPieces = useMemo(() => buildConfettiBurst(), []);

  // Compute completion vs mastery (mastery requires all 5 levels completed AND >= 80% recent accuracy)
  const subjectStats = useMemo(() => {
    const map = {} as Record<SubjectId, SubjectMasteryStats>;
    for (const subj of PRACTICE_SUBJECTS) {
      map[subj.id] = getSubjectMasteryStats(subj.id, EGYPT_LEVELS, progress);
    }
    return map;
  }, [progress]);

  // Trigger celebratory animation ONLY when a subject truly achieves Mastery (>=80% recent accuracy across all 5 levels)
  useEffect(() => {
    if (celebratingSubjectId) return;
    const newlyMastered = PRACTICE_SUBJECTS.find(
      (subj) =>
        subjectStats[subj.id]?.isMastered &&
        !progress.celebratedMasteredSubjects.includes(subj.id)
    );
    if (newlyMastered) {
      setCelebratingSubjectId(newlyMastered.id);
      setBurstKey((k) => k + 1);
      soundEngine.playMasteryFanfare();
    }
  }, [celebratingSubjectId, progress.celebratedMasteredSubjects, subjectStats]);

  const handleDismissCelebration = () => {
    if (!celebratingSubjectId) return;
    soundEngine.playClick();
    const finishedId = celebratingSubjectId;
    setCelebratingSubjectId(null);
    if (!progress.celebratedMasteredSubjects.includes(finishedId)) {
      onMarkSubjectCelebrated(finishedId);
    }
  };

  useModalFocusTrap(celebrationDialogRef, celebratingSubjectId !== null, handleDismissCelebration);

  const handleReplayCelebration = (e: React.MouseEvent, subjId: SubjectId) => {
    e.stopPropagation();
    setCelebratingSubjectId(subjId);
    setBurstKey((k) => k + 1);
    soundEngine.playMasteryFanfare();
  };

  const visibleSubjects: PracticeSubjectInfo[] =
    filter === 'all'
      ? PRACTICE_SUBJECTS
      : PRACTICE_SUBJECTS.filter((subj) => subj.worldId === filter);

  const exploredCount = progress.practicedSubjects.length;
  const completedCount = PRACTICE_SUBJECTS.filter((s) => subjectStats[s.id]?.isCompleted).length;
  const masteredCount = PRACTICE_SUBJECTS.filter((s) => subjectStats[s.id]?.isMastered).length;

  const celebratingSubject = celebratingSubjectId
    ? PRACTICE_SUBJECTS.find((s) => s.id === celebratingSubjectId) ?? null
    : null;
  const celebratingConfig = celebratingSubjectId
    ? EGYPT_SUBJECTS.find((s) => s.id === celebratingSubjectId) ?? null
    : null;
  const celebratingStats = celebratingSubjectId ? subjectStats[celebratingSubjectId] : null;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative w-full h-full bg-[#FCF9F0] flex flex-col overflow-y-auto"
    >
      <SectionNavHeader
        activeSection="practice"
        lang={lang}
        muted={progress.muted}
        musicEnabled={progress.musicEnabled}
        onNavigateHome={onNavigateHome}
        onNavigateGame={onNavigateGame}
        onNavigatePractice={() => {}}
        onNavigateExam={onNavigateExam}
        onNavigateStickers={onNavigateStickers}
        onToggleLang={onToggleLang}
        onToggleMute={onToggleMute}
        onToggleMusic={onToggleMusic}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-5 py-7 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#133C3B]/12">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-[#0F766E] mb-1">
              {t(UI_TEXT.primaryBadge, lang)}
            </div>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold text-[#133C3B]"
              style={{ textWrap: 'balance' }}
            >
              {t(UI_TEXT.practiceSectionTitle, lang)}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base font-medium text-[#475569]">
              {t(UI_TEXT.practiceSectionSub, lang)}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#64748B]">
              {t(UI_TEXT.masteryRuleNote, lang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-sm font-bold text-[#133C3B] tabular-nums shrink-0">
            <span>
              {t(UI_TEXT.subjectsExplored, lang)}{' '}
              <span className="text-[#0F766E]">
                {exploredCount}/{PRACTICE_SUBJECTS.length}
              </span>
            </span>
            <span className="text-[#94A3B8]" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1 text-[#0F766E]">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {t(UI_TEXT.completedLabel, lang)} {completedCount}/{PRACTICE_SUBJECTS.length}
              </span>
            </span>
            <span className="text-[#94A3B8]" aria-hidden="true">
              ·
            </span>
            <span className="inline-flex items-center gap-1.5 text-[#B45309]">
              <Trophy className="w-4 h-4 text-[#D97706]" />
              <span>
                {t(UI_TEXT.masteredLabel, lang)} {masteredCount}/{PRACTICE_SUBJECTS.length}
              </span>
            </span>
          </div>
        </div>

        <div
          role="tablist"
          aria-label={
            lang === 'ar'
              ? 'تصفية المواد حسب مجال المنهج'
              : 'Filter subjects by curriculum area'
          }
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F1EDE1] rounded-2xl w-fit"
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#133C3B] shadow-xs'
                    : 'text-[#475569] hover:text-[#133C3B]'
                }`}
              >
                {t(tab.label, lang)}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pb-36">
          {visibleSubjects.map((subj) => {
            const isExplored = progress.practicedSubjects.includes(subj.id);
            const stat = subjectStats[subj.id];
            const isCompleted = stat?.isCompleted ?? false;
            const isMastered = stat?.isMastered ?? false;
            const isSpotlighted = celebratingSubjectId === subj.id;

            return (
              <motion.div
                key={subj.id}
                animate={
                  isSpotlighted
                    ? { scale: [1, 1.04, 1], y: [0, -6, 0] }
                    : { scale: 1, y: 0 }
                }
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className={`relative overflow-hidden group rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                  lang === 'ar' ? 'text-right' : 'text-left'
                } ${
                  isMastered
                    ? 'bg-gradient-to-b from-[#FFFBEB] to-white border-2 border-[#D97706] shadow-sm'
                    : isCompleted
                    ? 'bg-gradient-to-b from-[#F0FDFA] to-white border-2 border-[#0D9488] shadow-xs'
                    : 'bg-white border border-[#133C3B]/20 hover:border-[#133C3B]'
                }`}
              >
                {/* Delicate Golden Mastery Shimmer Sweep (Mastered only) */}
                {isMastered && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-amber-200/45 to-transparent animate-mastery-shimmer"
                  />
                )}

                <button
                  type="button"
                  onClick={() => onSelectSubject(subj.id)}
                  className={`relative z-10 flex flex-col gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133C3B] rounded-xl ${
                    lang === 'ar' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[#133C3B]/10"
                      style={{ backgroundColor: subj.surfaceTint }}
                    >
                      <SubjectIcon id={subj.id} color={subj.accentColor} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isMastered ? (
                        <Trophy
                          className="w-4 h-4 text-[#D97706] shrink-0"
                          aria-label={t(UI_TEXT.masteredLabel, lang)}
                        />
                      ) : isCompleted ? (
                        <CheckCircle2
                          className="w-4 h-4 text-[#0D9488] shrink-0"
                          aria-label={t(UI_TEXT.completedLabel, lang)}
                        />
                      ) : null}
                      <span className="font-display text-sm font-bold text-[#94A3B8] tabular-nums">
                        {subj.order}.
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#64748B]">
                    <span>{t(WORLD_LABELS[subj.worldId], lang)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{t(subj.termTag, lang)}</span>
                    <span aria-hidden="true">·</span>
                    {isMastered ? (
                      <span className="inline-flex items-center gap-1 text-[#B45309] font-bold tabular-nums">
                        <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                        {t(UI_TEXT.masteredLabel, lang)}
                        {stat?.recentAccuracyPct !== null ? ` ${stat.recentAccuracyPct}%` : ''}
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[#0F766E] font-bold tabular-nums">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {t(UI_TEXT.completedLabel, lang)} 5/5
                        {stat?.recentAccuracyPct !== null ? ` · ${stat.recentAccuracyPct}%` : ''}
                      </span>
                    ) : (
                      <span className="tabular-nums">
                        {stat?.completedLevels ?? 0}/5 {t(UI_TEXT.levelsDone, lang)}
                      </span>
                    )}
                    {isExplored && !isMastered && !isCompleted && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 text-[#0F766E] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t(UI_TEXT.exploredLabel, lang)}
                        </span>
                      </>
                    )}
                  </div>

                  <div>
                    <h2 className="font-display text-lg font-bold text-[#133C3B] leading-snug group-hover:text-[#0F766E] transition-colors">
                      {t(subj.title, lang)}
                    </h2>
                    <p className="mt-1.5 text-sm text-[#475569] leading-relaxed">
                      {t(subj.summary, lang)}
                    </p>
                  </div>
                </button>

                <div className="relative z-10 pt-3 border-t border-[#133C3B]/10 flex items-center justify-between gap-2 text-sm font-bold">
                  <button
                    type="button"
                    onClick={() => onSelectSubject(subj.id)}
                    className="inline-flex items-center gap-1.5 text-[#0F766E] hover:text-[#115E59] cursor-pointer whitespace-nowrap"
                  >
                    <span>{t(UI_TEXT.startLesson, lang)}</span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform duration-150 ${
                        lang === 'ar'
                          ? 'rotate-180 group-hover:-translate-x-1'
                          : 'group-hover:translate-x-1'
                      }`}
                    />
                  </button>

                  {isMastered && (
                    <button
                      type="button"
                      onClick={(e) => handleReplayCelebration(e, subj.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] hover:text-[#92400E] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t(UI_TEXT.celebrateAgain, lang)}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Celebratory Subject Mastery Overlay (Triggers ONLY when all 5 levels are complete with >= 80% recent accuracy) */}
      <AnimatePresence>
        {celebratingSubject && celebratingConfig && celebratingStats && (
          <motion.div
            key={`mastery-overlay-${celebratingSubject.id}-${burstKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleDismissCelebration}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mastery-celebration-title"
            className="fixed inset-0 z-50 bg-[#133C3B]/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-hidden"
          >
            {/* Geometric Nile Gold & Turquoise Confetti Shower */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
              {confettiPieces.map((p) => (
                <motion.div
                  key={`${burstKey}-${p.id}`}
                  initial={{
                    x: `${p.startX}vw`,
                    y: '-8vh',
                    rotate: 0,
                    scale: 0.6,
                    opacity: 1,
                  }}
                  animate={{
                    x: `calc(${p.startX}vw + ${p.driftX}px)`,
                    y: '108vh',
                    rotate: p.rotation,
                    scale: [0.7, 1.15, 0.95],
                    opacity: [1, 1, 0.2],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  style={{
                    position: 'absolute',
                    width: p.shape === 'ribbon' ? p.size * 0.55 : p.size,
                    height: p.shape === 'ribbon' ? p.size * 1.65 : p.size,
                    backgroundColor: p.color,
                    borderRadius:
                      p.shape === 'circle' ? '9999px' : p.shape === 'ribbon' ? '3px' : '2px',
                    transform: p.shape === 'diamond' ? 'rotate(45deg)' : undefined,
                  }}
                />
              ))}
            </div>

            {/* Celebratory Medallion Card */}
            <motion.div
              ref={celebrationDialogRef}
              tabIndex={-1}
              initial={{ scale: 0.78, y: 28, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.88, y: 16, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5 overflow-hidden outline-none"
            >
              <button
                type="button"
                onClick={handleDismissCelebration}
                aria-label={lang === 'ar' ? 'إغلاق الاحتفال' : 'Close celebration'}
                className={`absolute top-4 ${
                  lang === 'ar' ? 'left-4' : 'right-4'
                } w-9 h-9 rounded-xl bg-white border border-[#133C3B]/20 text-[#475569] hover:text-[#133C3B] hover:bg-[#FEF3C7] flex items-center justify-center cursor-pointer`}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Spinning Sunburst Halo + Subject Medallion + Trophy Crown */}
              <div className="relative flex items-center justify-center w-36 h-36 mt-1">
                <svg
                  viewBox="0 0 160 160"
                  className="absolute inset-0 w-full h-full animate-sun-spin text-amber-300/75"
                  aria-hidden="true"
                >
                  {Array.from({ length: 12 }, (_, idx) => (
                    <polygon
                      key={idx}
                      points="80,4 87,32 73,32"
                      fill="currentColor"
                      transform={`rotate(${idx * 30} 80 80)`}
                    />
                  ))}
                </svg>

                <motion.div
                  initial={{ scale: 0.4, rotate: -18 }}
                  animate={{ scale: [0.4, 1.12, 1], rotate: [-18, 6, 0] }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 w-24 h-24 rounded-3xl bg-[#FEFCE8] border-2 border-[#D97706] shadow-lg flex items-center justify-center"
                >
                  <EgyptStickerSvg
                    stickerId={celebratingConfig.stickerId}
                    unlocked
                    size={76}
                  />
                </motion.div>

                <motion.div
                  initial={{ y: -14, scale: 0 }}
                  animate={{ y: 0, scale: 1 }}
                  transition={{ delay: 0.28, type: 'spring', stiffness: 420, damping: 18 }}
                  className="absolute -top-1 z-20 w-9 h-9 rounded-xl bg-[#D97706] border-2 border-[#133C3B] text-white flex items-center justify-center shadow-md"
                >
                  <Trophy className="w-5 h-5" />
                </motion.div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#D97706] flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {t(UI_TEXT.allFiveComplete, lang)}
                    {celebratingStats.recentAccuracyPct !== null
                      ? ` · ${celebratingStats.recentAccuracyPct}%`
                      : ''}
                  </span>
                </div>
                <h2
                  id="mastery-celebration-title"
                  className="font-display text-2xl sm:text-3xl font-bold text-[#133C3B] mt-1"
                  style={{ textWrap: 'balance' }}
                >
                  {t(UI_TEXT.subjectMasteredTitle, lang)}
                </h2>
                <div
                  className="font-display text-lg font-bold mt-1"
                  style={{ color: celebratingSubject.accentColor }}
                >
                  {t(celebratingSubject.title, lang)}
                </div>
                <p className="mt-1.5 text-sm font-medium text-[#475569]">
                  {t(UI_TEXT.subjectMasteredSub, lang)}
                </p>
              </div>

              {/* Staggered 5-Level Mastery Medal Row */}
              <div className="w-full grid grid-cols-5 gap-2">
                {celebratingStats.starsPerLevel.map((stars, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.4, opacity: 0, y: 12 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.18 + idx * 0.08,
                      type: 'spring',
                      stiffness: 380,
                      damping: 20,
                    }}
                    className="rounded-2xl bg-[#FEFCE8] border-2 border-[#D97706]/50 py-2.5 px-1 flex flex-col items-center gap-1"
                  >
                    <span className="font-display text-xs font-bold text-[#133C3B] tabular-nums">
                      {t(UI_TEXT.levelShort, lang)}
                      {idx + 1}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          className={`w-3 h-3 ${
                            n <= stars
                              ? 'text-[#F59E0B] fill-[#F59E0B]'
                              : 'text-[#CBD5E1] fill-[#E2E8F0]'
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-sm font-bold text-[#133C3B] tabular-nums flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                <span>
                  {celebratingStats.earnedStars} / 15 {t(UI_TEXT.stars, lang)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDismissCelebration}
                className="w-full h-13 rounded-2xl bg-[#D97706] hover:bg-[#B45309] border-2 border-b-4 border-[#133C3B] text-white font-display text-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-transform active:translate-y-0.5"
              >
                <Sparkles className="w-5 h-5" />
                <span>{t(UI_TEXT.awesomeContinue, lang)}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
