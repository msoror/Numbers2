import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Languages, Lightbulb, Music, Pause, Volume2, VolumeX } from 'lucide-react';
import { BazaarMiniGame } from './components/BazaarMiniGame';
import { ClockMiniGame } from './components/ClockMiniGame';
import { PauseModal, RoundSummaryModal } from './components/GameModals';
import { NileMiniGame } from './components/NileMiniGame';
import { PracticeMenuScreen } from './components/PracticeMenuScreen';
import { PracticeSubjectLab } from './components/PracticeSubjectLab';
import { StickerBookScreen } from './components/StickerBookScreen';
import { TitleScreen } from './components/TitleScreen';
import { WalkingCompanion } from './components/WalkingCompanion';
import { WorkshopMeasureMiniGame } from './components/WorkshopMeasureMiniGame';
import { WorldMapScreen } from './components/WorldMapScreen';
import {
  EGYPT_LEVELS,
  EGYPT_SUBJECTS,
  generateSubjectQuestions,
  generateTargetedQuestions,
  getQuestionSkillKey,
} from './data/egyptLevels';
import { t, UI_TEXT } from './data/i18n';
import {
  ActiveQuestion,
  GameScreenState,
  LevelConfig,
  PlayerProgress,
  PracticeSubjectId,
  RoundAdvancePayload,
  RoundResult,
  ShopItem,
  SubjectId,
  WorldId,
} from './types/game';
import {
  advanceRoundSession,
  appendLevelAttempt,
  computeRoundRewards,
  createDefaultProgress,
  createRoundSession,
  getLevelRecentAccuracy,
  getNextContinueLevel,
  isLevelMastered,
  migrateProgress,
  recordRoundAttempt,
  REPEATED_MISTAKE_THRESHOLD,
  RoundSessionState,
} from './utils/scoring';
import { soundEngine } from './utils/sound';

const STORAGE_KEY = 'nile_numbers_p2_progress_v1';

const VALID_SUBJECT_IDS = new Set<string>(EGYPT_SUBJECTS.map((s) => s.id));
const VALID_LEVEL_IDS = new Set<string>(EGYPT_LEVELS.map((l) => l.id));

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as unknown;
    return migrateProgress(parsed, VALID_LEVEL_IDS, VALID_SUBJECT_IDS);
  } catch {
    return createDefaultProgress();
  }
}

export default function App() {
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [screen, setScreen] = useState<GameScreenState>('TITLE_MENU');

  const [practiceFilter, setPracticeFilter] = useState<WorldId | 'all'>('all');
  const [activePracticeSubject, setActivePracticeSubject] =
    useState<PracticeSubjectId>('place_value');

  const [activeLevel, setActiveLevel] = useState<LevelConfig>(EGYPT_LEVELS[0]);
  const [activeQuestions, setActiveQuestions] = useState<ActiveQuestion[]>([]);
  const [isTargetedRound, setIsTargetedRound] = useState(false);
  const [targetedSkillKey, setTargetedSkillKey] = useState<string | null>(null);
  const [repeatedMistakeSkill, setRepeatedMistakeSkill] = useState<string | null>(null);

  const [roundSession, setRoundSession] = useState<RoundSessionState>(() =>
    createRoundSession(6, 0)
  );
  const roundSessionRef = useRef<RoundSessionState>(roundSession);

  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [lastAttemptFeedback, setLastAttemptFeedback] = useState<{
    isCorrect: boolean;
    seq: number;
  } | null>(null);
  const [mobileGuideOpen, setMobileGuideOpen] = useState(false);

  const lang = progress.language;
  const isPaused = screen === 'PAUSED';

  const continueLevel = useMemo(
    () => getNextContinueLevel(EGYPT_LEVELS, progress),
    [progress]
  );

  useEffect(() => {
    soundEngine.setMuted(progress.muted);
    soundEngine.setMusicEnabled(progress.musicEnabled);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  // Start the warm procedural lofi background beat seamlessly on the first user gesture
  useEffect(() => {
    const unlockAndStartMusic = () => {
      if (!progress.muted && progress.musicEnabled) {
        soundEngine.ensureMusicStarted();
      }
    };
    window.addEventListener('pointerdown', unlockAndStartMusic, { passive: true });
    window.addEventListener('keydown', unlockAndStartMusic, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAndStartMusic);
      window.removeEventListener('keydown', unlockAndStartMusic);
    };
  }, [progress.muted, progress.musicEnabled]);

  const toggleMute = useCallback(() => {
    setProgress((prev) => {
      const nextMuted = !prev.muted;
      soundEngine.setMuted(nextMuted);
      if (!nextMuted) {
        soundEngine.playClick();
        if (prev.musicEnabled) {
          soundEngine.ensureMusicStarted();
        }
      }
      return { ...prev, muted: nextMuted };
    });
  }, []);

  const toggleMusic = useCallback(() => {
    setProgress((prev) => {
      if (prev.muted) {
        soundEngine.setMuted(false);
        soundEngine.setMusicEnabled(true);
        soundEngine.ensureMusicStarted();
        soundEngine.playClick();
        return { ...prev, muted: false, musicEnabled: true };
      }
      const nextEnabled = !prev.musicEnabled;
      soundEngine.setMusicEnabled(nextEnabled);
      if (nextEnabled) {
        soundEngine.ensureMusicStarted();
      }
      soundEngine.playClick();
      return { ...prev, musicEnabled: nextEnabled };
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    soundEngine.playClick();
    setProgress((prev) => ({
      ...prev,
      language: prev.language === 'en' ? 'ar' : 'en',
    }));
  }, []);

  const markSubjectCelebrated = useCallback((subjectId: SubjectId) => {
    setProgress((prev) => {
      if (prev.celebratedMasteredSubjects.includes(subjectId)) return prev;
      return {
        ...prev,
        celebratedMasteredSubjects: [...prev.celebratedMasteredSubjects, subjectId],
      };
    });
  }, []);

  const handlePurchaseCosmetic = useCallback((item: ShopItem) => {
    setProgress((prev) => {
      if (prev.purchasedCosmetics.includes(item.id) || prev.totalGems < item.price) {
        return prev;
      }
      const nextPurchased = [...prev.purchasedCosmetics, item.id];
      const nextEquipped = { ...prev.equippedCosmetics };
      if (item.category === 'outfit') nextEquipped.outfitId = item.id;
      if (item.category === 'accessory') nextEquipped.accessoryId = item.id;
      if (item.category === 'trail') nextEquipped.trailId = item.id;

      return {
        ...prev,
        totalGems: prev.totalGems - item.price,
        purchasedCosmetics: nextPurchased,
        equippedCosmetics: nextEquipped,
      };
    });
    soundEngine.playStickerUnlock();
  }, []);

  const handleToggleEquipCosmetic = useCallback((item: ShopItem) => {
    soundEngine.playClick();
    setProgress((prev) => {
      if (!prev.purchasedCosmetics.includes(item.id)) return prev;
      const nextEquipped = { ...prev.equippedCosmetics };
      if (item.category === 'outfit') {
        nextEquipped.outfitId = nextEquipped.outfitId === item.id ? null : item.id;
      } else if (item.category === 'accessory') {
        nextEquipped.accessoryId = nextEquipped.accessoryId === item.id ? null : item.id;
      } else if (item.category === 'trail') {
        nextEquipped.trailId = nextEquipped.trailId === item.id ? null : item.id;
      }
      return { ...prev, equippedCosmetics: nextEquipped };
    });
  }, []);

  const openHome = useCallback(() => {
    soundEngine.playClick();
    setMobileGuideOpen(false);
    setScreen('TITLE_MENU');
  }, []);

  const openGameMenu = useCallback(() => {
    soundEngine.playClick();
    setMobileGuideOpen(false);
    setScreen('MAP_SELECT');
  }, []);

  const openPracticeMenu = useCallback((filter: WorldId | 'all' = 'all') => {
    soundEngine.playClick();
    setMobileGuideOpen(false);
    setPracticeFilter(filter);
    setScreen('PRACTICE_MENU');
  }, []);

  const openPracticeSubject = useCallback((subjectId: PracticeSubjectId) => {
    soundEngine.playClick();
    setMobileGuideOpen(false);
    setActivePracticeSubject(subjectId);
    setProgress((prev) => {
      if (prev.practicedSubjects.includes(subjectId)) return prev;
      return {
        ...prev,
        practicedSubjects: [...prev.practicedSubjects, subjectId],
      };
    });
    setScreen('PRACTICE_SUBJECT');
  }, []);

  const openStickers = useCallback(() => {
    soundEngine.playClick();
    setMobileGuideOpen(false);
    setScreen('STICKER_BOOK');
  }, []);

  const startLevel = useCallback(
    (level: LevelConfig) => {
      soundEngine.playClick();
      setActiveLevel(level);
      setIsTargetedRound(false);
      setTargetedSkillKey(null);
      setRepeatedMistakeSkill(null);
      setRoundResult(null);
      setLastAttemptFeedback(null);
      setMobileGuideOpen(false);

      const initialSession = createRoundSession(level.roundsCount, progress.bestStreak);
      roundSessionRef.current = initialSession;
      setRoundSession(initialSession);

      const freshQuestions = generateSubjectQuestions(
        level.subjectId,
        level.levelNumber,
        level.roundsCount
      );
      setActiveQuestions(freshQuestions);

      setScreen('PLAYING');
    },
    [progress.bestStreak]
  );

  const startTargetedPractice = useCallback(
    (level: LevelConfig, skillKey: string) => {
      soundEngine.playClick();
      setActiveLevel(level);
      setIsTargetedRound(true);
      setTargetedSkillKey(skillKey);
      setRepeatedMistakeSkill(null);
      setRoundResult(null);
      setLastAttemptFeedback(null);
      setMobileGuideOpen(false);

      const focusedQuestions = generateTargetedQuestions(
        level.subjectId,
        level.levelNumber,
        skillKey,
        3
      );
      const initialSession = createRoundSession(focusedQuestions.length, progress.bestStreak);
      roundSessionRef.current = initialSession;
      setRoundSession(initialSession);
      setActiveQuestions(focusedQuestions);

      setScreen('PLAYING');
    },
    [progress.bestStreak]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && screen === 'PLAYING') {
        soundEngine.playClick();
        setMobileGuideOpen(false);
        setScreen('PAUSED');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen]);

  const currentQuestion = activeQuestions[roundSession.roundIndex];

  const handleAttempt = useCallback(
    (isCorrect: boolean) => {
      if (isPaused) return;
      const skillKey = currentQuestion ? getQuestionSkillKey(currentQuestion) : undefined;
      const nextSession = recordRoundAttempt(roundSessionRef.current, isCorrect, skillKey);
      roundSessionRef.current = nextSession;
      setRoundSession(nextSession);

      setLastAttemptFeedback((prev) => ({ isCorrect, seq: (prev?.seq ?? 0) + 1 }));

      if (isCorrect) {
        // Update bestStreak after EVERY answer, not only at round end
        setProgress((prev) =>
          nextSession.bestStreak > prev.bestStreak
            ? { ...prev, bestStreak: nextSession.bestStreak }
            : prev
        );
      } else if (skillKey) {
        setProgress((prev) => {
          const nextCount = (prev.mistakeCountsBySkill[skillKey] ?? 0) + 1;
          return {
            ...prev,
            mistakeCountsBySkill: {
              ...prev.mistakeCountsBySkill,
              [skillKey]: nextCount,
            },
          };
        });
      }
    },
    [currentQuestion, isPaused]
  );

  const handleAdvanceRound = useCallback(
    (payload: RoundAdvancePayload) => {
      if (isPaused) return;
      const nextSession = advanceRoundSession(roundSessionRef.current, payload);
      roundSessionRef.current = nextSession;
      setRoundSession(nextSession);

      if (!nextSession.finished) {
        return;
      }

      const rewards = computeRoundRewards(nextSession);

      // Detect repeated mistake type during this round or cumulative across recent attempts
      let detectedRepeatSkill: string | null = null;
      if (!isTargetedRound && nextSession.mistakeSkills.length > 0) {
        const countsInRound: Record<string, number> = {};
        for (const sk of nextSession.mistakeSkills) {
          countsInRound[sk] = (countsInRound[sk] ?? 0) + 1;
          if (countsInRound[sk] >= REPEATED_MISTAKE_THRESHOLD) {
            detectedRepeatSkill = sk;
            break;
          }
        }
        if (!detectedRepeatSkill) {
          for (const sk of nextSession.mistakeSkills) {
            if ((progress.mistakeCountsBySkill[sk] ?? 0) >= REPEATED_MISTAKE_THRESHOLD) {
              detectedRepeatSkill = sk;
              break;
            }
          }
        }
      }
      setRepeatedMistakeSkill(detectedRepeatSkill);

      const alreadyHasSticker =
        isTargetedRound || progress.unlockedStickers.includes(activeLevel.stickerId);

      setRoundResult({
        levelId: activeLevel.id,
        correctFirstTry: rewards.correctFirstTry,
        totalRounds: rewards.totalRounds,
        starsEarned: rewards.starsEarned,
        gemsEarned: rewards.gemsEarned,
        newlyUnlockedSticker: alreadyHasSticker ? null : activeLevel.stickerId,
      });

      setProgress((prev) => {
        const nextMistakeCounts = { ...prev.mistakeCountsBySkill };
        if (isTargetedRound && targetedSkillKey) {
          delete nextMistakeCounts[targetedSkillKey];
        }

        if (isTargetedRound) {
          return {
            ...prev,
            totalGems: prev.totalGems + rewards.gemsEarned,
            bestStreak: Math.max(prev.bestStreak, rewards.bestStreak),
            mistakeCountsBySkill: nextMistakeCounts,
          };
        }

        const prevBest = prev.starsByLevel[activeLevel.id] ?? 0;
        const updatedStars = {
          ...prev.starsByLevel,
          [activeLevel.id]: Math.max(prevBest, rewards.starsEarned),
        };
        const totalStars = EGYPT_LEVELS.reduce(
          (sum, lvl) => sum + (updatedStars[lvl.id] ?? 0),
          0
        );
        const hasSticker = prev.unlockedStickers.includes(activeLevel.stickerId);
        const updatedStickers = hasSticker
          ? prev.unlockedStickers
          : [...prev.unlockedStickers, activeLevel.stickerId];

        const updatedAttempts = {
          ...prev.recentAttemptsByLevel,
          [activeLevel.id]: appendLevelAttempt(
            prev.recentAttemptsByLevel[activeLevel.id],
            rewards.correctFirstTry,
            rewards.totalRounds
          ),
        };

        return {
          ...prev,
          starsByLevel: updatedStars,
          recentAttemptsByLevel: updatedAttempts,
          mistakeCountsBySkill: nextMistakeCounts,
          unlockedStickers: updatedStickers,
          totalStars,
          totalGems: prev.totalGems + rewards.gemsEarned,
          bestStreak: Math.max(prev.bestStreak, rewards.bestStreak),
        };
      });

      soundEngine.playStickerUnlock();
      setScreen('ROUND_SUMMARY');
    },
    [
      activeLevel,
      isPaused,
      isTargetedRound,
      progress.mistakeCountsBySkill,
      progress.unlockedStickers,
      targetedSkillKey,
    ]
  );

  const currentLevelIndex = EGYPT_LEVELS.findIndex((l) => l.id === activeLevel.id);
  const nextLevel =
    currentLevelIndex >= 0 && currentLevelIndex + 1 < EGYPT_LEVELS.length
      ? EGYPT_LEVELS[currentLevelIndex + 1]
      : null;

  const isMusicPlaying = progress.musicEnabled && !progress.muted;
  const levelRecentAcc = getLevelRecentAccuracy(activeLevel.id, progress);
  const levelRecentAccPct = levelRecentAcc !== null ? Math.round(levelRecentAcc * 100) : null;
  const levelMasteredNow = isLevelMastered(activeLevel.id, progress);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FCF9F0]">
      {screen === 'TITLE_MENU' && (
        <TitleScreen
          progress={progress}
          continueLevel={continueLevel}
          onContinueLearning={startLevel}
          onStart={openGameMenu}
          onOpenPractice={() => openPracticeMenu('all')}
          onOpenStickers={openStickers}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
          onToggleLang={toggleLanguage}
        />
      )}

      {screen === 'MAP_SELECT' && (
        <WorldMapScreen
          progress={progress}
          onSelectLevel={startLevel}
          onBackToTitle={openHome}
          onOpenPractice={openPracticeMenu}
          onPracticeSubject={openPracticeSubject}
          onOpenStickers={openStickers}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
          onToggleLang={toggleLanguage}
        />
      )}

      {screen === 'PRACTICE_MENU' && (
        <PracticeMenuScreen
          progress={progress}
          initialFilter={practiceFilter}
          onSelectSubject={openPracticeSubject}
          onMarkSubjectCelebrated={markSubjectCelebrated}
          onNavigateHome={openHome}
          onNavigateGame={openGameMenu}
          onNavigateStickers={openStickers}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
          onToggleLang={toggleLanguage}
        />
      )}

      {screen === 'PRACTICE_SUBJECT' && (
        <PracticeSubjectLab
          subjectId={activePracticeSubject}
          progress={progress}
          onSelectSubject={openPracticeSubject}
          onBackToMenu={() => openPracticeMenu('all')}
          onLaunchLevel={startLevel}
          onNavigateHome={openHome}
          onNavigateGame={openGameMenu}
          onNavigateStickers={openStickers}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
          onToggleLang={toggleLanguage}
        />
      )}

      {screen === 'STICKER_BOOK' && (
        <StickerBookScreen
          progress={progress}
          onPurchaseCosmetic={handlePurchaseCosmetic}
          onToggleEquipCosmetic={handleToggleEquipCosmetic}
          onNavigateHome={openHome}
          onNavigateGame={openGameMenu}
          onNavigatePractice={() => openPracticeMenu('all')}
          onToggleMute={toggleMute}
          onToggleMusic={toggleMusic}
          onToggleLang={toggleLanguage}
        />
      )}

      {(screen === 'PLAYING' || screen === 'PAUSED' || screen === 'ROUND_SUMMARY') && (
        <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="relative w-full h-full">
          {/* Background gameplay stage is inert & non-interactive while Paused */}
          <div
            aria-hidden={isPaused || screen === 'ROUND_SUMMARY'}
            className={`w-full h-full ${
              isPaused || screen === 'ROUND_SUMMARY' ? 'pointer-events-none select-none' : ''
            }`}
          >
            {/* Responsive Phone & Desktop Top Perimeter HUD */}
            <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 px-3 sm:px-4 pt-2.5 sm:pt-3 flex items-center justify-between gap-2">
              <div className="pointer-events-auto flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setMobileGuideOpen(false);
                    setScreen('PAUSED');
                  }}
                  aria-label={t(UI_TEXT.pause, lang)}
                  className="h-10 px-2.5 sm:px-3.5 rounded-xl bg-[#FFFDF7] border-2 border-[#133C3B] text-[#133C3B] font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm hover:bg-[#FEF3C7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Pause className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{t(UI_TEXT.pause, lang)}</span>
                </button>

                {/* Non-truncating Question X/Y indicator (compact on 390px phone, full context on >= md) */}
                <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B]/30 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-[#133C3B] tabular-nums shadow-xs flex items-center gap-1.5 min-w-0">
                  <span className="hidden md:inline truncate">
                    {isTargetedRound
                      ? t(UI_TEXT.targetedRoundTitle, lang)
                      : t(activeLevel.subjectName, lang)}
                  </span>
                  {!isTargetedRound && (
                    <>
                      <span className="hidden md:inline text-[#64748B]" aria-hidden="true">
                        ·
                      </span>
                      <span className="hidden md:inline whitespace-nowrap shrink-0">
                        {t(UI_TEXT.levelShort, lang)}
                        {activeLevel.levelNumber}
                      </span>
                    </>
                  )}
                  <span className="hidden md:inline text-[#64748B]" aria-hidden="true">
                    ·
                  </span>
                  <span className="whitespace-nowrap shrink-0">
                    {t(UI_TEXT.questionLabel, lang)} {roundSession.roundIndex + 1}/
                    {roundSession.totalRounds}
                  </span>
                </div>
              </div>

              <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
                <div className="hidden lg:flex items-center gap-2 bg-[#FFFDF7]/95 border-2 border-[#133C3B]/30 rounded-xl px-3.5 py-1.5 text-sm font-bold text-[#133C3B] tabular-nums shadow-xs whitespace-nowrap">
                  <span>
                    {t(UI_TEXT.streak, lang)} {roundSession.streak}
                  </span>
                  <span className="text-[#64748B]" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    {t(UI_TEXT.gems, lang)} {progress.totalGems}
                  </span>
                </div>

                {/* Mobile-only compact Guide button (opens top coaching drawer away from answers) */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setMobileGuideOpen((open) => !open);
                  }}
                  aria-expanded={mobileGuideOpen}
                  aria-label={t(UI_TEXT.guideButton, lang)}
                  className={`md:hidden h-10 px-2.5 rounded-xl border-2 border-[#133C3B] font-bold text-xs flex items-center gap-1 shadow-sm cursor-pointer whitespace-nowrap shrink-0 ${
                    mobileGuideOpen
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FFFDF7] text-[#133C3B]'
                  }`}
                >
                  <Lightbulb className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>{t(UI_TEXT.guideButton, lang)}</span>
                </button>

                {/* Desktop-only Language & Lofi Music buttons (accessible inside Pause menu on < md phones) */}
                <button
                  type="button"
                  onClick={toggleLanguage}
                  aria-label="Toggle language"
                  className="hidden md:flex h-10 px-3 rounded-xl bg-[#FFFDF7] border-2 border-[#133C3B] text-[#133C3B] font-bold text-xs items-center gap-1 shadow-sm hover:bg-[#E0F2FE] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Languages className="w-4 h-4 text-[#0D9488]" />
                  <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMusic}
                  aria-pressed={isMusicPlaying}
                  aria-label={
                    isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)
                  }
                  title={
                    isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)
                  }
                  className={`hidden md:flex h-10 px-2.5 rounded-xl border-2 border-[#133C3B] font-bold text-xs items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isMusicPlaying
                      ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#FFFDF7] text-[#64748B] hover:text-[#133C3B]'
                  }`}
                >
                  <Music className="w-4 h-4 shrink-0" />
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
                  onClick={toggleMute}
                  aria-label={progress.muted ? 'Unmute sound' : 'Mute sound'}
                  className="w-10 h-10 rounded-xl bg-[#FFFDF7] border-2 border-[#133C3B] text-[#133C3B] flex items-center justify-center shadow-sm hover:bg-[#FEF3C7] transition-colors cursor-pointer shrink-0"
                >
                  {progress.muted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Active Mini-Game Stage */}
            {currentQuestion?.stage === 'bazaar' && (
              <BazaarMiniGame
                question={currentQuestion.data}
                lang={lang}
                isPaused={isPaused}
                onAttempt={handleAttempt}
                onAdvance={handleAdvanceRound}
              />
            )}

            {currentQuestion?.stage === 'nile' && (
              <NileMiniGame
                question={currentQuestion.data}
                lang={lang}
                isPaused={isPaused}
                onAttempt={handleAttempt}
                onAdvance={handleAdvanceRound}
              />
            )}

            {currentQuestion?.stage === 'clock' && (
              <ClockMiniGame
                question={currentQuestion.data}
                lang={lang}
                isPaused={isPaused}
                onAttempt={handleAttempt}
                onAdvance={handleAdvanceRound}
              />
            )}

            {currentQuestion?.stage === 'workshop' && (
              <WorkshopMeasureMiniGame
                question={currentQuestion.data}
                lang={lang}
                isPaused={isPaused}
                onAttempt={handleAttempt}
                onAdvance={handleAdvanceRound}
              />
            )}
          </div>

          {/* Pause Overlay */}
          {screen === 'PAUSED' && (
            <PauseModal
              level={activeLevel}
              lang={lang}
              muted={progress.muted}
              musicEnabled={progress.musicEnabled}
              onResume={() => {
                soundEngine.playClick();
                setScreen('PLAYING');
              }}
              onRestart={() =>
                isTargetedRound && targetedSkillKey
                  ? startTargetedPractice(activeLevel, targetedSkillKey)
                  : startLevel(activeLevel)
              }
              onExitToMap={openGameMenu}
              onToggleMute={toggleMute}
              onToggleMusic={toggleMusic}
              onToggleLang={toggleLanguage}
            />
          )}

          {/* Victory / Round Summary Modal */}
          {screen === 'ROUND_SUMMARY' && roundResult && (
            <RoundSummaryModal
              level={activeLevel}
              lang={lang}
              result={roundResult}
              hasNextLevel={!isTargetedRound && nextLevel !== null}
              isTargetedRound={isTargetedRound}
              levelRecentAccuracyPct={levelRecentAccPct}
              isLevelMasteredNow={levelMasteredNow}
              repeatedMistakeSkill={repeatedMistakeSkill}
              onStartTargetedPractice={
                repeatedMistakeSkill
                  ? () => startTargetedPractice(activeLevel, repeatedMistakeSkill)
                  : undefined
              }
              onNextLevel={() => {
                if (nextLevel) startLevel(nextLevel);
              }}
              onPlayAgain={() =>
                isTargetedRound && targetedSkillKey
                  ? startTargetedPractice(activeLevel, targetedSkillKey)
                  : startLevel(activeLevel)
              }
              onExitToMap={openGameMenu}
            />
          )}
        </div>
      )}

      {/* Theme-Linked Animated Walking Guides (Bigger Sobek & Horus + Cosmetics + Non-Overlapping Mobile Guide) */}
      <WalkingCompanion
        screen={screen}
        lang={lang}
        progress={progress}
        activeLevel={activeLevel}
        activePracticeSubject={activePracticeSubject}
        currentQuestion={currentQuestion}
        roundIndex={roundSession.roundIndex}
        streak={roundSession.streak}
        lastAttemptFeedback={lastAttemptFeedback}
        isPaused={isPaused}
        mobileGuideOpen={mobileGuideOpen}
        onMobileGuideOpenChange={setMobileGuideOpen}
      />
    </div>
  );
}
