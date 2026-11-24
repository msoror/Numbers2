import React, { useState } from 'react';
import { BookOpen, Lock, Shuffle, Star } from 'lucide-react';
import { EGYPT_LEVELS, EGYPT_SUBJECTS, WORLD_NAMES } from '../data/egyptLevels';
import { t, UI_TEXT } from '../data/i18n';
import { LevelConfig, PlayerProgress, SubjectId, WorldId } from '../types/game';
import { SubjectIcon } from './PracticeMenuScreen';
import { SectionNavHeader } from './SectionNavHeader';

interface WorldMapScreenProps {
  progress: PlayerProgress;
  onSelectLevel: (level: LevelConfig) => void;
  onBackToTitle: () => void;
  onOpenPractice: (worldFilter?: WorldId | 'all') => void;
  onPracticeSubject: (subjectId: SubjectId) => void;
  onOpenStickers: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

const WORLD_FILTERS: WorldId[] = ['bazaar', 'nile', 'clock', 'workshop'];

export const WorldMapScreen: React.FC<WorldMapScreenProps> = ({
  progress,
  onSelectLevel,
  onBackToTitle,
  onOpenPractice,
  onPracticeSubject,
  onOpenStickers,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const lang = progress.language;
  const [selectedWorld, setSelectedWorld] = useState<WorldId | 'all'>('all');

  const totalMaxStars = EGYPT_LEVELS.length * 3;

  const isLevelUnlocked = (level: LevelConfig): boolean => {
    if (level.levelNumber <= 2) return true;
    const prevId = `${level.subjectId}-${level.levelNumber - 1}`;
    return (progress.starsByLevel[prevId] ?? 0) > 0;
  };

  const visibleSubjects =
    selectedWorld === 'all'
      ? EGYPT_SUBJECTS
      : EGYPT_SUBJECTS.filter((s) => s.worldId === selectedWorld);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative w-full h-full bg-[#FCF9F0] flex flex-col overflow-y-auto select-none"
    >
      <SectionNavHeader
        activeSection="game"
        lang={lang}
        muted={progress.muted}
        musicEnabled={progress.musicEnabled}
        onNavigateHome={onBackToTitle}
        onNavigateGame={() => {}}
        onNavigatePractice={() => onOpenPractice('all')}
        onNavigateStickers={onOpenStickers}
        onToggleLang={onToggleLang}
        onToggleMute={onToggleMute}
        onToggleMusic={onToggleMusic}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-5 py-7 flex flex-col gap-6">
        {/* Game Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#133C3B]/12">
          <div className="max-w-2xl">
            <div className="text-xs font-bold text-[#D97706] mb-1 flex flex-wrap items-center gap-1.5">
              <span>{t(UI_TEXT.primaryBadge, lang)}</span>
              <span className="text-[#94A3B8]" aria-hidden="true">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-[#0F766E]">
                <Shuffle className="w-3.5 h-3.5" />
                {t(UI_TEXT.freshNumbersNote, lang)}
              </span>
            </div>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold text-[#133C3B]"
              style={{ textWrap: 'balance' }}
            >
              {t(UI_TEXT.gameSectionTitle, lang)}
            </h1>
            <p className="mt-1.5 text-sm sm:text-base font-medium text-[#475569]">
              {t(UI_TEXT.gameSectionSub, lang)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#133C3B] tabular-nums shrink-0">
            <span>
              {t(UI_TEXT.stars, lang)} {progress.totalStars}/{totalMaxStars}
            </span>
            <span className="text-[#94A3B8]" aria-hidden="true">
              ·
            </span>
            <span>
              {t(UI_TEXT.gems, lang)} {progress.totalGems}
            </span>
            <span className="text-[#94A3B8]" aria-hidden="true">
              ·
            </span>
            <span>
              {t(UI_TEXT.stickers, lang)} {progress.unlockedStickers.length}/12
            </span>
          </div>
        </div>

        {/* Theme Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter game subjects"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F1EDE1] rounded-2xl w-fit"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedWorld === 'all'}
            onClick={() => setSelectedWorld('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              selectedWorld === 'all'
                ? 'bg-white text-[#133C3B] shadow-xs'
                : 'text-[#475569] hover:text-[#133C3B]'
            }`}
          >
            {t(UI_TEXT.allSubjects, lang)}
          </button>
          {WORLD_FILTERS.map((w) => {
            const count = EGYPT_SUBJECTS.filter((s) => s.worldId === w).length;
            return (
              <button
                key={w}
                type="button"
                role="tab"
                aria-selected={selectedWorld === w}
                onClick={() => setSelectedWorld(w)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                  selectedWorld === w
                    ? 'bg-white text-[#133C3B] shadow-xs'
                    : 'text-[#475569] hover:text-[#133C3B]'
                }`}
              >
                {t(WORLD_NAMES[w], lang)} ({count})
              </button>
            );
          })}
        </div>

        {/* 12 Separated Subject Cards × 5 Progressive Levels */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch pb-8">
          {visibleSubjects.map((subject) => {
            const subjectLevels = EGYPT_LEVELS.filter((l) => l.subjectId === subject.id);
            const subjectStars = subjectLevels.reduce(
              (sum, lvl) => sum + (progress.starsByLevel[lvl.id] ?? 0),
              0
            );
            const subjectMaxStars = subjectLevels.length * 3;

            return (
              <section
                key={subject.id}
                className="bg-white border-2 border-[#133C3B] rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col gap-3.5"
              >
                {/* Subject Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-2xl border-2 border-[#133C3B]/15 flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: subject.surfaceTint }}
                    >
                      <SubjectIcon id={subject.id} color={subject.accentColor} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#64748B] flex flex-wrap items-center gap-1.5">
                        <span className="tabular-nums" style={{ color: subject.accentColor }}>
                          {subject.order}.
                        </span>
                        <span>{t(WORLD_NAMES[subject.worldId], lang)}</span>
                        <span className="text-[#CBD5E1]" aria-hidden="true">
                          ·
                        </span>
                        <span>{t(subject.termTag, lang)}</span>
                      </div>
                      <h2 className="font-display text-lg sm:text-xl font-bold text-[#133C3B] leading-snug mt-0.5">
                        {t(subject.title, lang)}
                      </h2>
                      <p className="text-xs font-semibold text-[#475569] mt-0.5 line-clamp-1">
                        {t(subject.subtitle, lang)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-[#133C3B] tabular-nums shrink-0 pt-0.5">
                    <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                    <span>
                      {subjectStars}/{subjectMaxStars}
                    </span>
                  </div>
                </div>

                {/* 5-Level Ladder (L1 & L2 Unlocked by Default, L3-L5 Unlock Progressively) */}
                <div className="flex-1 flex flex-col gap-2">
                  {subjectLevels.map((lvl) => {
                    const unlocked = isLevelUnlocked(lvl);
                    const stars = progress.starsByLevel[lvl.id] ?? 0;

                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        disabled={!unlocked}
                        onClick={() => onSelectLevel(lvl)}
                        className={`w-full min-h-[54px] px-3 py-2 rounded-2xl border-2 flex items-center justify-between gap-2.5 transition-transform duration-150 ${
                          lang === 'ar' ? 'text-right' : 'text-left'
                        } ${
                          unlocked
                            ? 'border-b-[3px] hover:-translate-y-0.5 active:translate-y-0.5 cursor-pointer'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                        }`}
                        style={
                          unlocked
                            ? {
                                backgroundColor: subject.surfaceTint,
                                borderColor: subject.accentColor,
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl font-display text-sm font-bold flex items-center justify-center shrink-0 border-2 tabular-nums ${
                              unlocked
                                ? 'bg-white'
                                : 'bg-[#E2E8F0] border-[#CBD5E1] text-[#94A3B8]'
                            }`}
                            style={
                              unlocked
                                ? {
                                    borderColor: subject.accentColor,
                                    color: subject.accentColor,
                                  }
                                : undefined
                            }
                          >
                            {unlocked ? lvl.levelNumber : <Lock className="w-3.5 h-3.5" />}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                className={`font-display text-sm font-bold truncate ${
                                  unlocked ? 'text-[#133C3B]' : 'text-[#64748B]'
                                }`}
                              >
                                {t(lvl.title, lang)}
                              </span>
                            </div>
                            <div className="text-[11px] font-semibold text-[#64748B] truncate">
                              {unlocked ? (
                                <>
                                  <span style={{ color: subject.accentColor }}>
                                    {t(lvl.difficultyLabel, lang)}
                                  </span>
                                  <span className="mx-1 text-[#94A3B8]" aria-hidden="true">
                                    ·
                                  </span>
                                  <span>{t(lvl.conceptSummary, lang)}</span>
                                </>
                              ) : (
                                `${t(UI_TEXT.finishPrevToUnlock, lang)} ${lvl.levelNumber - 1} ${t(
                                  UI_TEXT.toUnlock,
                                  lang
                                )}`
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-0.5 shrink-0"
                          aria-label={`${stars} of 3 stars`}
                        >
                          {[1, 2, 3].map((n) => (
                            <Star
                              key={n}
                              className={`w-3.5 h-3.5 ${
                                n <= stars
                                  ? 'text-[#F59E0B] fill-[#F59E0B]'
                                  : 'text-[#CBD5E1] fill-[#E2E8F0]'
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Direct Bridge to This Exact Subject's Interactive Practice Lab */}
                <div className="pt-2.5 border-t border-[#133C3B]/10 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onPracticeSubject(subject.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:text-[#115E59] py-1 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{t(UI_TEXT.practiceThisWorld, lang)}</span>
                  </button>

                  <span className="text-[11px] font-bold text-[#64748B] tabular-nums whitespace-nowrap">
                    5 {lang === 'ar' ? 'مستويات' : 'Levels'} · 6 {lang === 'ar' ? 'أسئلة' : 'Qs'}
                  </span>
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
