import React, { useEffect } from 'react';
import {
  Award,
  BookOpen,
  Gamepad2,
  Languages,
  Music,
  Play,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { EGYPT_LEVELS } from '../data/egyptLevels';
import { PRACTICE_SUBJECTS } from '../data/practiceSubjects';
import { t, UI_TEXT } from '../data/i18n';
import { BilingualText, LevelConfig, PlayerProgress, WorldId } from '../types/game';
import { EgyptTitleLockupSvg } from './EgyptSvgs';

interface TitleScreenProps {
  progress: PlayerProgress;
  continueLevel: LevelConfig;
  onContinueLearning: (level: LevelConfig) => void;
  onStart: () => void;
  onOpenPractice: () => void;
  onOpenStickers: () => void;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onToggleLang: () => void;
}

const CHART_WORLDS: {
  id: WorldId;
  label: BilingualText;
  barColor: string;
  trackBg: string;
}[] = [
  { id: 'bazaar', label: UI_TEXT.bazaarShort, barColor: '#D97706', trackBg: '#FEF3C7' },
  { id: 'nile', label: UI_TEXT.nileShort, barColor: '#0D9488', trackBg: '#CCFBF1' },
  { id: 'clock', label: UI_TEXT.clockShort, barColor: '#1D4ED8', trackBg: '#DBEAFE' },
  { id: 'workshop', label: UI_TEXT.workshopShort, barColor: '#16A34A', trackBg: '#DCFCE7' },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  progress,
  continueLevel,
  onContinueLearning,
  onStart,
  onOpenPractice,
  onOpenStickers,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const lang = progress.language;
  const isMusicPlaying = progress.musicEnabled && !progress.muted;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'BUTTON' || target.tagName === 'INPUT')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinueLearning(continueLevel);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [continueLevel, onContinueLearning]);

  const totalMaxStars = EGYPT_LEVELS.length * 3;
  const worldStarStats = CHART_WORLDS.map((w) => {
    const levels = EGYPT_LEVELS.filter((l) => l.worldId === w.id);
    const maxStars = levels.length * 3;
    const earned = levels.reduce((sum, lvl) => sum + (progress.starsByLevel[lvl.id] ?? 0), 0);
    return {
      ...w,
      earned,
      maxStars,
      pct: maxStars > 0 ? Math.round((earned / maxStars) * 100) : 0,
    };
  });

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative w-full h-full overflow-y-auto flex flex-col justify-between select-none"
    >
      {/* Illustrated Egyptian Nile Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-[#9ED8F6] via-[#FDE68A] to-[#0D9488] pointer-events-none"
        aria-hidden="true"
      >
        <img
          src="/src/assets/images/egypt_title_backdrop_1794872911388.jpg"
          alt="Sunlit Nile River oasis with felucca sailboat and Cairo domes"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF7]/50 via-transparent to-black/15" />
      </div>

      {/* Top Perimeter Audio & Language Controls */}
      <div className="relative z-10 flex items-center justify-end gap-2 px-4 sm:px-5 pt-4 pb-2 shrink-0">
        <button
          type="button"
          onClick={onToggleLang}
          aria-label="Switch language"
          className="h-10 sm:h-11 px-3.5 sm:px-4 rounded-2xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] text-[#133C3B] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer whitespace-nowrap shrink-0"
        >
          <Languages className="w-4 h-4 text-[#0D9488]" />
          <span>{lang === 'en' ? 'عربي' : 'English'}</span>
        </button>

        <button
          type="button"
          onClick={onToggleMusic}
          aria-pressed={isMusicPlaying}
          aria-label={isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
          title={isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
          className={`h-10 sm:h-11 px-3 sm:px-3.5 rounded-2xl border-2 border-[#133C3B] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer whitespace-nowrap shrink-0 ${
            isMusicPlaying ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FFFDF7]/95 text-[#64748B]'
          }`}
        >
          <Music className="w-4 h-4 shrink-0" />
          <span>{t(UI_TEXT.lofiShort, lang)}</span>
          {isMusicPlaying && (
            <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
              <span className="w-[2.5px] h-3 rounded-full bg-[#D97706] animate-eq-bar" />
              <span
                className="w-[2.5px] h-2 rounded-full bg-[#D97706] animate-eq-bar"
                style={{ animationDelay: '0.25s' }}
              />
              <span
                className="w-[2.5px] h-3 rounded-full bg-[#D97706] animate-eq-bar"
                style={{ animationDelay: '0.5s' }}
              />
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={progress.muted ? 'Unmute sound' : 'Mute sound'}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] text-[#133C3B] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
        >
          {progress.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content Split: Left Hero Lockup + Right Star Progress Dashboard
          Bottom padding (pb-36) reserves a dedicated promenade for the larger walking guide so it NEVER overlaps the chart */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 px-5 sm:px-10 lg:px-16 pb-36 sm:pb-40">
        {/* Left Calm-Sky Title Lockup & Section Menu Buttons */}
        <div className="max-w-lg w-full flex flex-col items-start gap-3.5 my-auto">
          <div className="w-full max-w-[340px] sm:max-w-[380px] animate-gentle-float drop-shadow-lg">
            <EgyptTitleLockupSvg lang={lang} className="w-full h-auto" />
          </div>

          <p className="text-sm sm:text-base font-bold text-[#133C3B] bg-[#FFFDF7]/92 border-2 border-[#133C3B]/20 rounded-2xl px-4 py-2.5 shadow-xs">
            {t(UI_TEXT.titleSubtitle, lang)}
          </p>

          {/* Direct Continue Learning CTA opening the next unfinished level */}
          <button
            type="button"
            onClick={() => onContinueLearning(continueLevel)}
            className="w-full sm:w-auto min-h-[56px] px-5 sm:px-6 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] border-2 border-b-[5px] border-[#14532D] text-white flex items-center justify-between sm:justify-start gap-3 shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Play className="w-5 h-5 fill-current shrink-0" />
              <div className={lang === 'ar' ? 'text-right min-w-0' : 'text-left min-w-0'}>
                <div className="font-display text-lg sm:text-xl font-bold leading-tight whitespace-nowrap">
                  {t(UI_TEXT.continueLearning, lang)}
                </div>
                <div className="text-xs font-semibold text-white/90 truncate tabular-nums">
                  {t(continueLevel.subjectName, lang)} · {t(UI_TEXT.levelShort, lang)}
                  {continueLevel.levelNumber}
                </div>
              </div>
            </div>
          </button>

          {/* Two-Section Menu: Game Section & Practice Section */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onStart}
              className="h-12 sm:h-13 px-5 sm:px-6 rounded-2xl bg-[#D97706] hover:bg-[#B45309] border-2 border-b-[4px] border-[#133C3B] text-white font-display text-lg sm:text-xl font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>{t(UI_TEXT.gameSectionTitle, lang)}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPractice}
              className="h-12 sm:h-13 px-5 sm:px-6 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] border-2 border-b-[4px] border-[#133C3B] text-white font-display text-lg sm:text-xl font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t(UI_TEXT.practiceSection, lang)}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenStickers}
            className="h-11 px-4 rounded-xl bg-[#FFFDF7]/95 hover:bg-[#FEF3C7] border-2 border-[#133C3B] text-[#133C3B] font-bold text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Award className="w-4 h-4 text-[#D97706]" />
            <span className="tabular-nums">
              {t(UI_TEXT.stickerBook, lang)} &amp; {t(UI_TEXT.gemShopTab, lang)} (
              {progress.unlockedStickers.length}/12)
            </span>
          </button>
        </div>

        {/* Visual Progress Dashboard (CSS Grid Star Collection Bar Chart) */}
        <section
          aria-label={t(UI_TEXT.starProgress, lang)}
          className="w-full max-w-sm bg-[#FFFDF7]/95 border-2 border-[#133C3B] rounded-3xl p-4 sm:p-5 shadow-xl shrink-0"
        >
          <div className="flex flex-col gap-1 pb-3 border-b border-[#E2E8F0]">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#133C3B]">
              {t(UI_TEXT.starProgress, lang)}
            </h2>
            <div className="text-xs font-bold text-[#475569] tabular-nums flex flex-wrap items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span className="text-[#133C3B]">
                {progress.totalStars}/{totalMaxStars}
              </span>
              <span className="text-[#94A3B8]" aria-hidden="true">
                ·
              </span>
              <span>
                {progress.totalGems} {t(UI_TEXT.gems, lang)}
              </span>
              <span className="text-[#94A3B8]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#0F766E]">
                {t(UI_TEXT.practiceSection, lang)} {progress.practicedSubjects.length}/
                {PRACTICE_SUBJECTS.length}
              </span>
            </div>
          </div>

          {/* CSS Grid Bar Chart */}
          <div className="relative mt-3 pt-2">
            <div
              className="pointer-events-none absolute inset-x-0 top-7 bottom-7 flex flex-col justify-between"
              aria-hidden="true"
            >
              <div className="border-t border-dashed border-[#CBD5E1]" />
              <div className="border-t border-dashed border-[#CBD5E1]" />
              <div className="border-t border-dashed border-[#CBD5E1]" />
            </div>

            <div className="relative grid grid-cols-4 gap-3 items-end">
              {worldStarStats.map((stat) => (
                <button
                  key={stat.id}
                  type="button"
                  onClick={onStart}
                  aria-label={`${t(stat.label, lang)}: ${stat.earned} of ${stat.maxStars} stars`}
                  className="group flex flex-col items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133C3B] rounded-xl py-1"
                >
                  <span className="text-xs font-bold text-[#133C3B] tabular-nums">
                    {stat.earned}/{stat.maxStars}
                  </span>

                  <div
                    className="w-10 sm:w-11 h-24 rounded-xl border-2 border-[#133C3B] flex flex-col justify-end overflow-hidden transition-transform duration-150 group-hover:-translate-y-0.5"
                    style={{ backgroundColor: stat.trackBg }}
                  >
                    <div
                      className="w-full transition-all duration-300 rounded-t-md"
                      style={{
                        height: `${stat.pct}%`,
                        minHeight: stat.earned > 0 ? '12px' : '0px',
                        backgroundColor: stat.barColor,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-[#133C3B] truncate max-w-full">
                    {t(stat.label, lang)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
