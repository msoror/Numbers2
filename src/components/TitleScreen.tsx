import React, { useEffect, useRef, useState } from 'react';
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Download,
  Gamepad2,
  HardDrive,
  Languages,
  Music,
  Play,
  RotateCcw,
  Star,
  Upload,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import egyptTitleBackdrop from '../assets/images/egypt_title_backdrop.webp';
import { EGYPT_LEVELS, EGYPT_SUBJECTS } from '../data/egyptLevels';
import { PRACTICE_SUBJECTS } from '../data/practiceSubjects';
import { t, UI_TEXT } from '../data/i18n';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';
import {
  ActiveLevelSessionSnapshot,
  BilingualText,
  LevelConfig,
  PlayerProgress,
  WorldId,
} from '../types/game';
import { parseProgressBackup, serializeProgressBackup } from '../utils/scoring';
import { soundEngine } from '../utils/sound';
import { EgyptTitleLockupSvg } from './EgyptSvgs';

interface TitleScreenProps {
  progress: PlayerProgress;
  continueLevel: LevelConfig;
  unfinishedSession: ActiveLevelSessionSnapshot | null;
  onContinueLearning: (level: LevelConfig) => void;
  onResumeUnfinishedLevel: () => void;
  onStart: () => void;
  onOpenPractice: () => void;
  onOpenLevelCheck: (view?: 'exam' | 'results') => void;
  onDismissPlacementPrompt: () => void;
  onImportProgress: (next: PlayerProgress) => void;
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

const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, summary, [role="button"], [tabindex]:not([tabindex="-1"])';

export const TitleScreen: React.FC<TitleScreenProps> = ({
  progress,
  continueLevel,
  unfinishedSession,
  onContinueLearning,
  onResumeUnfinishedLevel,
  onStart,
  onOpenPractice,
  onOpenLevelCheck,
  onDismissPlacementPrompt,
  onImportProgress,
  onOpenStickers,
  onToggleMute,
  onToggleMusic,
  onToggleLang,
}) => {
  const lang = progress.language;
  const isMusicPlaying = progress.musicEnabled && !progress.muted;

  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backupDialogRef = useRef<HTMLDivElement | null>(null);
  const promptDialogRef = useRef<HTMLDivElement | null>(null);

  const showFirstTimePrompt =
    !backupModalOpen &&
    progress.totalStars === 0 &&
    progress.placementHistory.length === 0 &&
    !progress.hasDismissedPlacementPrompt;

  useModalFocusTrap(backupDialogRef, backupModalOpen, () => setBackupModalOpen(false));
  useModalFocusTrap(promptDialogRef, showFirstTimePrompt, onDismissPlacementPrompt);

  // Scoped keyboard shortcut: NEVER hijack Enter/Space when any interactive control is focused or a modal is open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (backupModalOpen || showFirstTimePrompt) return;
      const target = e.target as HTMLElement | null;
      const active = document.activeElement as HTMLElement | null;
      if (
        (target && target.closest(INTERACTIVE_SELECTOR)) ||
        (active && active !== document.body && active.closest(INTERACTIVE_SELECTOR))
      ) {
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onContinueLearning(continueLevel);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [backupModalOpen, showFirstTimePrompt, continueLevel, onContinueLearning]);

  const unfinishedLevel = unfinishedSession
    ? EGYPT_LEVELS.find((l) => l.id === unfinishedSession.levelId) ?? null
    : null;

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

  const handleExportBackup = () => {
    soundEngine.playClick();
    const json = serializeProgressBackup(progress);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `nile-numbers-backup-${dateStamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseProgressBackup(
        content,
        new Set(EGYPT_LEVELS.map((l) => l.id)),
        new Set(EGYPT_SUBJECTS.map((s) => s.id))
      );
      if (parsed) {
        soundEngine.playMasteryFanfare();
        onImportProgress(parsed);
        setImportStatus('success');
      } else {
        soundEngine.playGentleMiss();
        setImportStatus('error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => {
      setImportStatus('error');
    };
    reader.readAsText(file);
  };

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="relative w-full h-full overflow-y-auto overflow-x-hidden flex flex-col justify-between select-none"
    >
      {/* Illustrated Egyptian Nile Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-b from-[#9ED8F6] via-[#FDE68A] to-[#0D9488] pointer-events-none"
        aria-hidden="true"
      >
        <img
          src={egyptTitleBackdrop}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#FFFDF7]/50 via-transparent to-black/15" />
      </div>

      {/* Top Perimeter Audio & Language Controls */}
      <div className="relative z-10 flex items-center justify-end gap-2 px-4 sm:px-5 pt-4 pb-2 shrink-0">
        <button
          type="button"
          onClick={onToggleLang}
          aria-label={t(UI_TEXT.switchLangAria, lang)}
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
          aria-label={progress.muted ? t(UI_TEXT.unmuteSoundAria, lang) : t(UI_TEXT.muteSoundAria, lang)}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFFDF7]/95 border-2 border-[#133C3B] text-[#133C3B] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
        >
          {progress.muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content Split: Left Hero Lockup + Right Star Progress Dashboard
          Bottom padding (pb-36) reserves a dedicated promenade for the larger walking guide so it NEVER overlaps the chart */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6 px-4 sm:px-10 lg:px-16 pb-36 sm:pb-40">
        {/* Left Calm-Sky Title Lockup & Section Menu Buttons */}
        <div className="max-w-lg w-full flex flex-col items-start gap-3 my-auto">
          <div className="w-full max-w-[330px] sm:max-w-[380px] animate-gentle-float drop-shadow-lg">
            <EgyptTitleLockupSvg lang={lang} className="w-full h-auto" />
          </div>

          <p className="text-sm sm:text-base font-bold text-[#133C3B] bg-[#FFFDF7]/92 border-2 border-[#133C3B]/20 rounded-2xl px-4 py-2.5 shadow-xs">
            {t(UI_TEXT.titleSubtitle, lang)}
          </p>

          {/* Resume Unfinished Level (shown when a saved in-progress level exists) */}
          {unfinishedSession && unfinishedLevel && (
            <button
              type="button"
              onClick={onResumeUnfinishedLevel}
              className="w-full sm:w-auto min-h-[54px] px-5 py-2 rounded-2xl bg-[#0284C7] hover:bg-[#0369A1] border-2 border-b-[5px] border-[#0C4A6E] text-white flex items-center gap-3 shadow-lg hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 shrink-0" />
              <div className={lang === 'ar' ? 'text-right min-w-0' : 'text-left min-w-0'}>
                <div className="font-display text-base sm:text-lg font-bold leading-tight whitespace-nowrap">
                  {t(UI_TEXT.resumeUnfinishedLevel, lang)}
                </div>
                <div className="text-xs font-semibold text-white/90 truncate tabular-nums">
                  {t(unfinishedLevel.subjectName, lang)} · {t(UI_TEXT.levelShort, lang)}
                  {unfinishedLevel.levelNumber} · {t(UI_TEXT.questionProgress, lang)}{' '}
                  {unfinishedSession.roundIndex + 1}/{unfinishedSession.questions.length}
                </div>
              </div>
            </button>
          )}

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

          {/* Main Section Buttons: Game Section, Practice Section, and Level Check */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onStart}
              className="h-12 px-4 sm:px-5 rounded-2xl bg-[#D97706] hover:bg-[#B45309] border-2 border-b-[4px] border-[#133C3B] text-white font-display text-base sm:text-lg font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>{t(UI_TEXT.gameSectionTitle, lang)}</span>
            </button>

            <button
              type="button"
              onClick={onOpenPractice}
              className="h-12 px-4 sm:px-5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] border-2 border-b-[4px] border-[#133C3B] text-white font-display text-base sm:text-lg font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-5 h-5" />
              <span>{t(UI_TEXT.practiceSection, lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenLevelCheck('exam')}
              className="h-12 px-4 sm:px-5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] border-2 border-b-[4px] border-[#133C3B] text-white font-display text-base sm:text-lg font-bold flex items-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer whitespace-nowrap shrink-0"
            >
              <ClipboardCheck className="w-5 h-5" />
              <span>{t(UI_TEXT.levelCheck, lang)}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenStickers}
              className="h-10 px-3.5 rounded-xl bg-[#FFFDF7]/95 hover:bg-[#FEF3C7] border-2 border-[#133C3B] text-[#133C3B] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Award className="w-4 h-4 text-[#D97706]" />
              <span className="tabular-nums">
                {t(UI_TEXT.stickerBook, lang)} &amp; {t(UI_TEXT.gemShopTab, lang)} (
                {progress.unlockedStickers.length}/12)
              </span>
            </button>

            {progress.placementHistory.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenLevelCheck('results')}
                className="h-10 px-3.5 rounded-xl bg-[#F5F3FF] hover:bg-[#EDE9FE] border-2 border-[#7C3AED]/50 text-[#5B21B6] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{t(UI_TEXT.viewLastResults, lang)}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setImportStatus('idle');
                setBackupModalOpen(true);
              }}
              className="h-10 px-3.5 rounded-xl bg-[#FFFDF7]/95 hover:bg-[#F0FDFA] border-2 border-[#133C3B]/40 text-[#133C3B] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <HardDrive className="w-4 h-4 text-[#0D9488]" />
              <span>{t(UI_TEXT.backupRestoreTitle, lang)}</span>
            </button>
          </div>
        </div>

        {/* Visual Progress Dashboard (CSS Grid Star Collection Bar Chart + Device-Only Storage Note) */}
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
                  aria-label={
                    lang === 'ar'
                      ? `${t(stat.label, lang)}: ${stat.earned} من ${stat.maxStars} نجمة`
                      : `${t(stat.label, lang)}: ${stat.earned} of ${stat.maxStars} stars`
                  }
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

          {/* Honest Device-Only Storage Note */}
          <p className="mt-3 pt-2.5 border-t border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 shrink-0 text-[#0D9488]" />
            <span>{t(UI_TEXT.deviceOnlyNote, lang)}</span>
          </p>
        </section>
      </div>

      {/* Backup & Restore Progress Modal (Focus-Trapped) */}
      {backupModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="backup-modal-title"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div
            ref={backupDialogRef}
            tabIndex={-1}
            className="w-full max-w-md bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 outline-none"
          >
            <div className="flex items-center justify-between gap-2">
              <h2
                id="backup-modal-title"
                className="font-display text-xl font-bold text-[#133C3B] flex items-center gap-2"
              >
                <HardDrive className="w-5 h-5 text-[#0D9488]" />
                <span>{t(UI_TEXT.backupRestoreTitle, lang)}</span>
              </h2>
              <button
                type="button"
                onClick={() => setBackupModalOpen(false)}
                aria-label={t(UI_TEXT.closeModalAria, lang)}
                className="w-9 h-9 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#133C3B] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#475569] leading-relaxed">
              {t(UI_TEXT.deviceOnlyNote, lang)}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="h-12 px-4 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] border-2 border-b-4 border-[#133C3B] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t(UI_TEXT.exportProgress, lang)}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-12 px-4 rounded-2xl bg-[#FEF3C7] hover:bg-[#FDE68A] border-2 border-b-4 border-[#D97706] text-[#78350F] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t(UI_TEXT.importProgress, lang)}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFileChange}
                className="hidden"
                aria-label={t(UI_TEXT.importProgress, lang)}
              />
            </div>

            {importStatus === 'success' && (
              <p className="text-xs font-bold text-[#15803D] bg-[#ECFDF5] border border-[#86EFAC] rounded-xl px-3 py-2">
                {t(UI_TEXT.importSuccess, lang)}
              </p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs font-bold text-[#B91C1C] bg-[#FEF2F2] border border-[#FCA5A5] rounded-xl px-3 py-2">
                {t(UI_TEXT.importError, lang)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* First-Time Player Level Check Prompt Modal (Skippable, Focus-Trapped) */}
      {showFirstTimePrompt && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="placement-prompt-title"
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <div
            ref={promptDialogRef}
            tabIndex={-1}
            className="w-full max-w-md bg-[#FFFDF7] border-2 border-[#133C3B] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 outline-none"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-[#EDE9FE] border-2 border-[#7C3AED] text-[#6D28D9] flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <h2
                  id="placement-prompt-title"
                  className="font-display text-xl font-bold text-[#133C3B] leading-snug"
                >
                  {t(UI_TEXT.placementPromptTitle, lang)}
                </h2>
              </div>
              <button
                type="button"
                onClick={onDismissPlacementPrompt}
                aria-label={t(UI_TEXT.closeModalAria, lang)}
                className="w-8 h-8 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569] flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-semibold text-[#475569] leading-relaxed">
              {t(UI_TEXT.placementPromptBody, lang)}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onDismissPlacementPrompt();
                  onOpenLevelCheck('exam');
                }}
                className="flex-1 h-12 px-4 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] border-2 border-b-4 border-[#133C3B] text-white font-display text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ClipboardCheck className="w-5 h-5" />
                <span>{t(UI_TEXT.takeLevelCheck, lang)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onDismissPlacementPrompt();
                }}
                className="h-12 px-4 rounded-2xl bg-white hover:bg-[#F1F5F9] border-2 border-[#133C3B]/25 text-[#475569] font-bold text-sm cursor-pointer"
              >
                {t(UI_TEXT.skipForNow, lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
