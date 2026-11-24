import { useCallback, useEffect, useState } from 'react';
import { Languages, Music, Pause, Volume2, VolumeX } from 'lucide-react';
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
} from './data/egyptLevels';
import { t, UI_TEXT } from './data/i18n';
import {
  ActiveQuestion,
  GameScreenState,
  LevelConfig,
  PlayerProgress,
  PracticeSubjectId,
  RoundResult,
  SubjectId,
  WorldId,
} from './types/game';
import { soundEngine } from './utils/sound';

const STORAGE_KEY = 'nile_numbers_p2_progress_v1';

const VALID_SUBJECT_IDS = new Set<string>(EGYPT_SUBJECTS.map((s) => s.id));
const VALID_LEVEL_IDS = new Set<string>(EGYPT_LEVELS.map((l) => l.id));

const DEFAULT_PROGRESS: PlayerProgress = {
  language: 'en',
  starsByLevel: {},
  unlockedStickers: [],
  practicedSubjects: [],
  celebratedMasteredSubjects: [],
  totalStars: 0,
  totalGems: 0,
  bestStreak: 0,
  muted: false,
  musicEnabled: true,
};

function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;

    const rawStars = parsed.starsByLevel ?? {};
    const sanitizedStars: Record<string, number> = {};
    let totalStars = 0;
    for (const [lvlId, stars] of Object.entries(rawStars)) {
      if (VALID_LEVEL_IDS.has(lvlId) && typeof stars === 'number' && stars > 0) {
        const clamped = Math.min(3, Math.max(0, Math.floor(stars)));
        sanitizedStars[lvlId] = clamped;
        totalStars += clamped;
      }
    }

    const sanitizedPracticed: SubjectId[] = Array.isArray(parsed.practicedSubjects)
      ? parsed.practicedSubjects.filter((id): id is SubjectId =>
          VALID_SUBJECT_IDS.has(String(id))
        )
      : [];

    const sanitizedCelebrated: SubjectId[] = Array.isArray(parsed.celebratedMasteredSubjects)
      ? parsed.celebratedMasteredSubjects.filter((id): id is SubjectId =>
          VALID_SUBJECT_IDS.has(String(id))
        )
      : [];

    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      language: parsed.language === 'ar' ? 'ar' : 'en',
      starsByLevel: sanitizedStars,
      totalStars,
      unlockedStickers: Array.isArray(parsed.unlockedStickers) ? parsed.unlockedStickers : [],
      practicedSubjects: sanitizedPracticed,
      celebratedMasteredSubjects: sanitizedCelebrated,
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
    };
  } catch {
    return DEFAULT_PROGRESS;
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

  const [roundIndex, setRoundIndex] = useState(0);
  const [missedCurrentRound, setMissedCurrentRound] = useState(false);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [lastAttemptFeedback, setLastAttemptFeedback] = useState<{
    isCorrect: boolean;
    seq: number;
  } | null>(null);

  const lang = progress.language;

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
      // If currently muted and user clicks Lofi Music, unmute and enable music smoothly
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

  const openHome = useCallback(() => {
    soundEngine.playClick();
    setScreen('TITLE_MENU');
  }, []);

  const openGameMenu = useCallback(() => {
    soundEngine.playClick();
    setScreen('MAP_SELECT');
  }, []);

  const openPracticeMenu = useCallback((filter: WorldId | 'all' = 'all') => {
    soundEngine.playClick();
    setPracticeFilter(filter);
    setScreen('PRACTICE_MENU');
  }, []);

  const openPracticeSubject = useCallback((subjectId: PracticeSubjectId) => {
    soundEngine.playClick();
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
    setScreen('STICKER_BOOK');
  }, []);

  const startLevel = useCallback((level: LevelConfig) => {
    soundEngine.playClick();
    setActiveLevel(level);
    setRoundIndex(0);
    setMissedCurrentRound(false);
    setFirstTryCount(0);
    setStreak(0);
    setRoundResult(null);
    setLastAttemptFeedback(null);

    // Auto-generate brand-new randomized exam numbers on every level start / replay / restart
    const freshQuestions = generateSubjectQuestions(
      level.subjectId,
      level.levelNumber,
      level.roundsCount
    );
    setActiveQuestions(freshQuestions);

    setScreen('PLAYING');
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (screen === 'PLAYING') {
          soundEngine.playClick();
          setScreen('PAUSED');
        } else if (screen === 'PAUSED') {
          soundEngine.playClick();
          setScreen('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen]);

  const handleAttempt = useCallback(
    (isCorrect: boolean) => {
      setLastAttemptFeedback((prev) => ({ isCorrect, seq: (prev?.seq ?? 0) + 1 }));
      if (isCorrect) {
        if (!missedCurrentRound) {
          setFirstTryCount((c) => c + 1);
          setStreak((s) => s + 1);
        } else {
          setStreak(1);
        }
      } else {
        setMissedCurrentRound(true);
        setStreak(0);
      }
    },
    [missedCurrentRound]
  );

  const handleAdvanceRound = useCallback(() => {
    const nextIdx = roundIndex + 1;
    if (nextIdx < activeLevel.roundsCount) {
      setRoundIndex(nextIdx);
      setMissedCurrentRound(false);
      return;
    }

    const starsEarned: 1 | 2 | 3 =
      firstTryCount >= 5 ? 3 : firstTryCount >= 3 ? 2 : 1;
    const gemsEarned = firstTryCount * 5 + starsEarned * 10;

    const alreadyHasSticker = progress.unlockedStickers.includes(activeLevel.stickerId);
    setRoundResult({
      levelId: activeLevel.id,
      correctFirstTry: firstTryCount,
      totalRounds: activeLevel.roundsCount,
      starsEarned,
      gemsEarned,
      newlyUnlockedSticker: alreadyHasSticker ? null : activeLevel.stickerId,
    });

    setProgress((prev) => {
      const prevBest = prev.starsByLevel[activeLevel.id] ?? 0;
      const updatedStars = {
        ...prev.starsByLevel,
        [activeLevel.id]: Math.max(prevBest, starsEarned),
      };
      const totalStars = EGYPT_LEVELS.reduce(
        (sum, lvl) => sum + (updatedStars[lvl.id] ?? 0),
        0
      );
      const hasSticker = prev.unlockedStickers.includes(activeLevel.stickerId);
      const updatedStickers = hasSticker
        ? prev.unlockedStickers
        : [...prev.unlockedStickers, activeLevel.stickerId];

      return {
        ...prev,
        starsByLevel: updatedStars,
        unlockedStickers: updatedStickers,
        totalStars,
        totalGems: prev.totalGems + gemsEarned,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    });

    soundEngine.playStickerUnlock();
    setScreen('ROUND_SUMMARY');
  }, [activeLevel, firstTryCount, progress.unlockedStickers, roundIndex, streak]);

  const currentLevelIndex = EGYPT_LEVELS.findIndex((l) => l.id === activeLevel.id);
  const nextLevel =
    currentLevelIndex >= 0 && currentLevelIndex + 1 < EGYPT_LEVELS.length
      ? EGYPT_LEVELS[currentLevelIndex + 1]
      : null;

  const currentQuestion = activeQuestions[roundIndex];
  const isMusicPlaying = progress.musicEnabled && !progress.muted;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#FCF9F0]">
      {screen === 'TITLE_MENU' && (
        <TitleScreen
          progress={progress}
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
          {/* Unobtrusive Top Perimeter HUD */}
          <div className="pointer-events-none fixed top-0 left-0 right-0 z-30 px-4 pt-3 flex items-center justify-between gap-3">
            <div className="pointer-events-auto flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setScreen('PAUSED');
                }}
                aria-label="Pause game"
                className="h-10 px-3.5 rounded-xl bg-[#FFFDF7] border-2 border-[#133C3B] text-[#133C3B] font-bold text-sm flex items-center gap-1.5 shadow-sm hover:bg-[#FEF3C7] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Pause className="w-4 h-4" />
                <span>{t(UI_TEXT.pause, lang)}</span>
              </button>

              <div className="bg-[#FFFDF7]/95 border-2 border-[#133C3B]/30 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#133C3B] tabular-nums shadow-xs truncate">
                <span>{t(activeLevel.subjectName, lang)}</span>
                <span className="mx-1.5 text-[#64748B]" aria-hidden="true">
                  ·
                </span>
                <span>
                  {t(UI_TEXT.levelShort, lang)}
                  {activeLevel.levelNumber}
                </span>
                <span className="mx-1.5 text-[#64748B]" aria-hidden="true">
                  ·
                </span>
                <span>
                  {t(UI_TEXT.round, lang)} {roundIndex + 1}/{activeLevel.roundsCount}
                </span>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-2 bg-[#FFFDF7]/95 border-2 border-[#133C3B]/30 rounded-xl px-3.5 py-1.5 text-sm font-bold text-[#133C3B] tabular-nums shadow-xs">
                <span>
                  {t(UI_TEXT.streak, lang)} {streak}
                </span>
                <span className="text-[#64748B]" aria-hidden="true">
                  ·
                </span>
                <span>
                  {t(UI_TEXT.gems, lang)} {progress.totalGems}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleLanguage}
                aria-label="Toggle language"
                className="h-10 px-3 rounded-xl bg-[#FFFDF7] border-2 border-[#133C3B] text-[#133C3B] font-bold text-xs flex items-center gap-1 shadow-sm hover:bg-[#E0F2FE] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Languages className="w-4 h-4 text-[#0D9488]" />
                <span>{lang === 'en' ? 'عربي' : 'EN'}</span>
              </button>

              <button
                type="button"
                onClick={toggleMusic}
                aria-pressed={isMusicPlaying}
                aria-label={isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
                title={isMusicPlaying ? t(UI_TEXT.lofiMusicOn, lang) : t(UI_TEXT.lofiMusicOff, lang)}
                className={`h-10 px-2.5 rounded-xl border-2 border-[#133C3B] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                className="w-10 h-10 rounded-xl bg-[#FFFDF7] border-2 border-[#133C3B] text-[#133C3B] flex items-center justify-center shadow-sm hover:bg-[#FEF3C7] transition-colors cursor-pointer"
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
              onAttempt={handleAttempt}
              onAdvance={handleAdvanceRound}
            />
          )}

          {currentQuestion?.stage === 'nile' && (
            <NileMiniGame
              question={currentQuestion.data}
              lang={lang}
              onAttempt={handleAttempt}
              onAdvance={handleAdvanceRound}
            />
          )}

          {currentQuestion?.stage === 'clock' && (
            <ClockMiniGame
              question={currentQuestion.data}
              lang={lang}
              onAttempt={handleAttempt}
              onAdvance={handleAdvanceRound}
            />
          )}

          {currentQuestion?.stage === 'workshop' && (
            <WorkshopMeasureMiniGame
              question={currentQuestion.data}
              lang={lang}
              onAttempt={handleAttempt}
              onAdvance={handleAdvanceRound}
            />
          )}

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
              onRestart={() => startLevel(activeLevel)}
              onExitToMap={openGameMenu}
              onToggleMute={toggleMute}
              onToggleMusic={toggleMusic}
              onToggleLang={toggleLanguage}
            />
          )}

          {/* Victory Modal */}
          {screen === 'ROUND_SUMMARY' && roundResult && (
            <RoundSummaryModal
              level={activeLevel}
              lang={lang}
              result={roundResult}
              hasNextLevel={nextLevel !== null}
              onNextLevel={() => {
                if (nextLevel) startLevel(nextLevel);
              }}
              onPlayAgain={() => startLevel(activeLevel)}
              onExitToMap={openGameMenu}
            />
          )}
        </div>
      )}

      {/* Theme-Linked Animated Walking Guides (Sobek Nile Crocodile & Horus Falcon) */}
      <WalkingCompanion
        screen={screen}
        lang={lang}
        progress={progress}
        activeLevel={activeLevel}
        activePracticeSubject={activePracticeSubject}
        currentQuestion={currentQuestion}
        roundIndex={roundIndex}
        streak={streak}
        lastAttemptFeedback={lastAttemptFeedback}
      />
    </div>
  );
}
